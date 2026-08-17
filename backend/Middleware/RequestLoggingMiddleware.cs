using System.Diagnostics;
using System.Text;

namespace backend.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestId = Guid.NewGuid().ToString();

        // Add request ID to response headers for tracing
        context.Response.Headers.Append("X-Request-ID", requestId);

        // Log request
        await LogRequestAsync(context, requestId);

        // Capture original response body stream
        var originalBodyStream = context.Response.Body;

        try
        {
            using var responseBodyStream = new MemoryStream();
            context.Response.Body = responseBodyStream;

            await _next(context);

            stopwatch.Stop();

            // Log response
            await LogResponseAsync(context, requestId, stopwatch.ElapsedMilliseconds);

            // Copy response back to original stream
            responseBodyStream.Seek(0, SeekOrigin.Begin);
            await responseBodyStream.CopyToAsync(originalBodyStream);
        }
        finally
        {
            context.Response.Body = originalBodyStream;
        }
    }

    private async Task LogRequestAsync(HttpContext context, string requestId)
    {
        var request = context.Request;

        var logMessage = new StringBuilder();
        logMessage.AppendLine($"[{requestId}] Incoming Request:");
        logMessage.AppendLine($"Method: {request.Method}");
        logMessage.AppendLine($"Path: {request.Path}");
        logMessage.AppendLine($"QueryString: {request.QueryString}");
        logMessage.AppendLine($"Headers: {string.Join(", ", request.Headers.Select(h => $"{h.Key}={string.Join(",", h.Value.ToArray())}"))}");

        // Log request body for POST/PUT requests (exclude sensitive endpoints)
        if ((request.Method == "POST" || request.Method == "PUT") && 
            !request.Path.Value?.Contains("password", StringComparison.OrdinalIgnoreCase) == true &&
            !request.Path.Value?.Contains("login", StringComparison.OrdinalIgnoreCase) == true)
        {
            request.EnableBuffering();
            var body = await new StreamReader(request.Body, Encoding.UTF8).ReadToEndAsync();
            request.Body.Position = 0;
            
            if (!string.IsNullOrEmpty(body))
            {
                logMessage.AppendLine($"Body: {body}");
            }
        }

        _logger.LogInformation(logMessage.ToString());
    }

    private async Task LogResponseAsync(HttpContext context, string requestId, long elapsedMilliseconds)
    {
        var response = context.Response;

        var logMessage = new StringBuilder();
        logMessage.AppendLine($"[{requestId}] Outgoing Response:");
        logMessage.AppendLine($"StatusCode: {response.StatusCode}");
        logMessage.AppendLine($"ContentType: {response.ContentType}");
        logMessage.AppendLine($"ElapsedTime: {elapsedMilliseconds}ms");

        // Log response body for errors or if it's a small response
        if (response.StatusCode >= 400 || response.Body.Length < 1024)
        {
            response.Body.Seek(0, SeekOrigin.Begin);
            var body = await new StreamReader(response.Body, Encoding.UTF8).ReadToEndAsync();
            response.Body.Seek(0, SeekOrigin.Begin);
            
            if (!string.IsNullOrEmpty(body))
            {
                logMessage.AppendLine($"Body: {body}");
            }
        }

        // Use different log levels based on response status
        if (response.StatusCode >= 500)
        {
            _logger.LogError(logMessage.ToString());
        }
        else if (response.StatusCode >= 400)
        {
            _logger.LogWarning(logMessage.ToString());
        }
        else
        {
            _logger.LogInformation(logMessage.ToString());
        }
    }
}