using backend.Common;
using backend.Models;

namespace backend.Repositories;

public interface INotificationRepository : IRepository<Notification>
{
    Task<PagedResult<Notification>> GetPagedByCustomerIdAsync(int customerId, PaginationParams pagination);
    Task<IEnumerable<Notification>> GetUnreadByCustomerIdAsync(int customerId);
    Task<int> GetUnreadCountAsync(int customerId);
    Task MarkAsReadAsync(int notificationId);
    Task MarkAllAsReadAsync(int customerId);
}
