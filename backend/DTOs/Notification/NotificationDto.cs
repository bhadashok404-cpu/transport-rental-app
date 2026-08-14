using backend.Enums;

namespace backend.DTOs.Notification;

public class NotificationDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public int? BookingId { get; set; }
    public DateTime CreatedAt { get; set; }
}
