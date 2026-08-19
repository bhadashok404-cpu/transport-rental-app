using backend.Common;
using backend.DTOs.Auth;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return result.IsSuccess
            ? Ok(ApiResponse<AuthResponse>.SuccessResponse(result.Data!, result.Message))
            : Unauthorized(ApiResponse<AuthResponse>.ErrorResponse(result.Message, result.Errors));
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return result.IsSuccess
            ? Ok(ApiResponse<AuthResponse>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<AuthResponse>.ErrorResponse(result.Message, result.Errors));
    }
}