using backend.Enums;

namespace backend.DTOs.CarpoolBooking;

public class CarpoolBookingDto
{
    public int Id { get; set; }

    // Ride offer summary
    public int RideOfferId { get; set; }
    public string OriginCity { get; set; } = string.Empty;
    public string DestinationCity { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public int? EstimatedDurationMinutes { get; set; }

    // Driver summary
    public int DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string? DriverPhone { get; set; }
    public decimal DriverRating { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;

    // Passenger / booking details
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int SeatsBooked { get; set; }
    public decimal TotalPrice { get; set; }
    public CarpoolBookingStatus Status { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Payment
    public int? PaymentId { get; set; }
    public PaymentStatus? PaymentStatus { get; set; }

    public DateTime CreatedAt { get; set; }
}
