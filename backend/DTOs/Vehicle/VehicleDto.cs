using backend.Enums;

namespace backend.DTOs.Vehicle;

public class VehicleDto
{
    public int Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public VehicleType VehicleType { get; set; }
    public int VehicleCategoryId { get; set; }
    public string VehicleCategoryName { get; set; } = string.Empty;
    public decimal PricePerDay { get; set; }
    public decimal PricePerKm { get; set; }
    public int SeatingCapacity { get; set; }
    public string FuelType { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public bool IsActive { get; set; }
    public int? CurrentDriverId { get; set; }
    public string? CurrentDriverName { get; set; }
    public DateTime CreatedAt { get; set; }
}
