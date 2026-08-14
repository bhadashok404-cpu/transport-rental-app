namespace backend.DTOs.VehicleCategory;

public class UpdateVehicleCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal PricePerKm { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
}
