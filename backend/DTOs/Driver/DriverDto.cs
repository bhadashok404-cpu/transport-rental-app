using backend.Enums;

namespace backend.DTOs.Driver;

public class DriverDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public DateTime LicenseExpiryDate { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public decimal Rating { get; set; }
    public int TotalTrips { get; set; }
    public DriverStatus Status { get; set; }
    public bool IsVerified { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastActiveAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
