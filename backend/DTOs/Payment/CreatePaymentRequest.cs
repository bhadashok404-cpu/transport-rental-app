using backend.Enums;

namespace backend.DTOs.Payment;

public class CreatePaymentRequest
{
    public int BookingId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
}
