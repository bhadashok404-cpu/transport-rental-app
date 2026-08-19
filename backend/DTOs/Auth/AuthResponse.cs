using backend.Enums;

namespace backend.DTOs.Auth;

public class AuthResponse
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public int? CustomerId { get; set; }
    public int? DriverId { get; set; }
    public string Token { get; set; } = string.Empty;
}