namespace backend.DTOs.VehicleCategory;

public class VehicleCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal PricePerKm { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public int VehicleCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
