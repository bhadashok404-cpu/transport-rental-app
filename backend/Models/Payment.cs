using backend.Enums;

namespace backend.Models;

public class Payment
{
    public int Id { get; set; }

    /// <summary>Nullable — carpool payments are not linked to a classic Booking.</summary>
    public int? BookingId { get; set; }
    public Booking? Booking { get; set; }

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public decimal Amount { get; set; }

    public PaymentMethod PaymentMethod { get; set; }

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public string? TransactionId { get; set; }

    public string? PaymentGatewayResponse { get; set; }

    public DateTime? PaidAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
