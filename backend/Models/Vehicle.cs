namespace backend.Models;

public class Vehicle
{
    public int Id { get; set; }

    public string RegistrationNumber { get; set; } = string.Empty;

    public string Make { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public int Year { get; set; }

    public string VehicleType { get; set; } = string.Empty;

    public decimal PricePerDay { get; set; }

    public bool IsAvailable { get; set; } = true;
}