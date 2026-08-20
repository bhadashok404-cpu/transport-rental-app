using backend.Enums;

namespace backend.DTOs.Account;

public class ProfileDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public int? CustomerId { get; set; }
    public int? DriverId { get; set; }
}
