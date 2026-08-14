using backend.Enums;

namespace backend.DTOs.Driver;

public class UpdateDriverRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public DateTime LicenseExpiryDate { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public DriverStatus Status { get; set; }
    public bool IsActive { get; set; }
}
