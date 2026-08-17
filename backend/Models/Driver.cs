using backend.Enums;

namespace backend.Models;

public class Driver
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string LicenseNumber { get; set; } = string.Empty;

    public DateTime LicenseExpiryDate { get; set; }

    public string Address { get; set; } = string.Empty;

    public string? ProfileImageUrl { get; set; }

    public decimal Rating { get; set; } = 0;

    public int TotalTrips { get; set; } = 0;

    public DriverStatus Status { get; set; } = DriverStatus.Available;

    public bool IsVerified { get; set; } = false;

    public bool IsActive { get; set; } = true;

    public DateTime? LastActiveAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
