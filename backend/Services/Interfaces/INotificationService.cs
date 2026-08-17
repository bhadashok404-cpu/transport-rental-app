using backend.Common;
using backend.DTOs.Notification;

namespace backend.Services.Interfaces;

public interface INotificationService
{
    Task<ServiceResult<PagedResult<NotificationDto>>> GetPagedNotificationsByCustomerIdAsync(int customerId, PaginationParams pagination);
    Task<ServiceResult<IEnumerable<NotificationDto>>> GetUnreadNotificationsByCustomerIdAsync(int customerId);
    Task<ServiceResult<int>> GetUnreadCountAsync(int customerId);
    Task<ServiceResult> MarkAsReadAsync(int notificationId);
    Task<ServiceResult> MarkAllAsReadAsync(int customerId);
    Task<ServiceResult<NotificationDto>> CreateNotificationAsync(CreateNotificationRequest request);
}
