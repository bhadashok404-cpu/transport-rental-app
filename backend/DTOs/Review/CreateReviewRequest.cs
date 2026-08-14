namespace backend.DTOs.Review;

public class CreateReviewRequest
{
    public int BookingId { get; set; }
    public int? DriverId { get; set; }
    public int? VehicleId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public bool IsDriverReview { get; set; }
    public bool IsVehicleReview { get; set; }
}
