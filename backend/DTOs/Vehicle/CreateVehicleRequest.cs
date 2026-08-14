using backend.Enums;

namespace backend.DTOs.Vehicle;

public class CreateVehicleRequest
{
    public string RegistrationNumber { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public VehicleType VehicleType { get; set; }
    public int VehicleCategoryId { get; set; }
    public decimal PricePerDay { get; set; }
    public decimal PricePerKm { get; set; }
    public int SeatingCapacity { get; set; }
    public string FuelType { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}
