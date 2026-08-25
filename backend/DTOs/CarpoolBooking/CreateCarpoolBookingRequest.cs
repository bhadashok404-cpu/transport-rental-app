using backend.Enums;

namespace backend.DTOs.CarpoolBooking;

public class CreateCarpoolBookingRequest
{
    public int RideOfferId { get; set; }

    /// <summary>Populated from JWT claim — do not send from client.</summary>
    public int CustomerId { get; set; }

    public int SeatsBooked { get; set; } = 1;

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.UPI;
}
