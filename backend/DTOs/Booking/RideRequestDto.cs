using backend.Enums;

namespace backend.DTOs.Booking;

public class RideRequestDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;
    public string PickupLocation { get; set; } = string.Empty;
    public string DropLocation { get; set; } = string.Empty;
    public DateTime PickupDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public decimal EstimatedPrice { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public RideRequestStatus Status { get; set; }
    public string? DriverName { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
}