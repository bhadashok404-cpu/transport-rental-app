using backend.Enums;

namespace backend.Models;

public class Vehicle
{
    public int Id { get; set; }

    public string RegistrationNumber { get; set; } = string.Empty;

    public string Make { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public int Year { get; set; }

    public VehicleType VehicleType { get; set; }

    public int VehicleCategoryId { get; set; }
    public VehicleCategory VehicleCategory { get; set; } = null!;

    public decimal PricePerDay { get; set; }

    public decimal PricePerKm { get; set; }

    public int SeatingCapacity { get; set; }

    public string FuelType { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public bool IsAvailable { get; set; } = true;

    public bool IsActive { get; set; } = true;

    public int? CurrentDriverId { get; set; }
    public Driver? CurrentDriver { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}