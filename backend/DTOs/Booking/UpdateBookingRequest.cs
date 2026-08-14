using backend.Enums;

namespace backend.DTOs.Booking;

public class UpdateBookingRequest
{
    public string PickupLocation { get; set; } = string.Empty;
    public string DropLocation { get; set; } = string.Empty;
    public DateTime PickupDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public string? SpecialInstructions { get; set; }
}
