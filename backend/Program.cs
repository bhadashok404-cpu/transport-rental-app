using backend.Services;
using backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS - allow React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// CORS
app.UseCors("Frontend");

// OpenAPI + Swagger UI
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/openapi/v1.json",
            "Transport Rental API v1");
    });
}

// HTTPS redirection disabled for local HTTP development
// app.UseHttpsRedirection();

// API endpoints
app.MapVehicleEndpoints();
app.MapCustomerEndpoints();
app.MapBookingEndpoints();

app.Run();