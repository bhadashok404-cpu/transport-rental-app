using backend.Enums;

namespace backend.DTOs.Notification;

public class CreateNotificationRequest
{
    public int CustomerId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? BookingId { get; set; }
}
