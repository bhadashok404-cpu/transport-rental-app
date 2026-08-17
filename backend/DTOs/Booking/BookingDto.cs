using backend.Enums;

namespace backend.DTOs.Booking;

public class BookingDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public int VehicleId { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;
    public string VehicleRegistration { get; set; } = string.Empty;
    public int? DriverId { get; set; }
    public string? DriverName { get; set; }
    public string? DriverPhone { get; set; }
    public string PickupLocation { get; set; } = string.Empty;
    public string DropLocation { get; set; } = string.Empty;
    public DateTime PickupDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public DateTime? ActualPickupTime { get; set; }
    public DateTime? ActualDropTime { get; set; }
    public decimal EstimatedPrice { get; set; }
    public decimal? ActualPrice { get; set; }
    public decimal? DiscountAmount { get; set; }
    public string? CouponCode { get; set; }
    public decimal? DistanceInKm { get; set; }
    public BookingStatus Status { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? SpecialInstructions { get; set; }
    public DateTime CreatedAt { get; set; }
}
