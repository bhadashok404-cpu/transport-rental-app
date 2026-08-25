using backend.Enums;

namespace backend.Models;

public class CarpoolBooking
{
    public int Id { get; set; }

    public int RideOfferId { get; set; }
    public RideOffer RideOffer { get; set; } = null!;

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    /// <summary>Number of seats the passenger is booking (usually 1).</summary>
    public int SeatsBooked { get; set; } = 1;

    /// <summary>SeatsBooked × RideOffer.PricePerSeat at time of booking.</summary>
    public decimal TotalPrice { get; set; }

    public CarpoolBookingStatus Status { get; set; } = CarpoolBookingStatus.Pending;

    /// <summary>Linked payment record. Null until payment is initiated.</summary>
    public int? PaymentId { get; set; }
    public Payment? Payment { get; set; }

    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
