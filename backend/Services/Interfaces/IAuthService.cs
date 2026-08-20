using backend.Common;
using backend.DTOs.Auth;

namespace backend.Services.Interfaces;

public interface IAuthService
{
    Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request);
    Task<ServiceResult<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ServiceResult> CreateAdminAsync(CreateAdminRequest request);
    Task<ServiceResult> ResetPasswordAsync(ResetPasswordRequest request);
}