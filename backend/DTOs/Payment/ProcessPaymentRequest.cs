namespace backend.DTOs.Payment;

public class ProcessPaymentRequest
{
    public string TransactionId { get; set; } = string.Empty;
    public string? PaymentGatewayResponse { get; set; }
}
