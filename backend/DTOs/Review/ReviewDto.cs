namespace backend.DTOs.Review;

public class ReviewDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int? DriverId { get; set; }
    public string? DriverName { get; set; }
    public int? VehicleId { get; set; }
    public string? VehicleInfo { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public bool IsDriverReview { get; set; }
    public bool IsVehicleReview { get; set; }
    public DateTime CreatedAt { get; set; }
}
