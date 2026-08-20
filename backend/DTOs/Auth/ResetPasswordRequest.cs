using backend.Enums;

namespace backend.DTOs.Auth;

public class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string NewPassword { get; set; } = string.Empty;
}
