namespace backend.DTOs.Booking;

public class CreateBookingRequest
{
    public int CustomerId { get; set; }
    public int VehicleId { get; set; }
    public string PickupLocation { get; set; } = string.Empty;
    public string DropLocation { get; set; } = string.Empty;
    public DateTime PickupDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public string? CouponCode { get; set; }
    public string? SpecialInstructions { get; set; }
}
