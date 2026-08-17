using backend.Common;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class NotificationRepository : Repository<Notification>, INotificationRepository
{
    public NotificationRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<PagedResult<Notification>> GetPagedByCustomerIdAsync(int customerId, PaginationParams pagination)
    {
        var query = _dbSet
            .Where(n => n.CustomerId == customerId);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<Notification>.Create(items, totalCount, pagination.Page, pagination.PageSize);
    }

    public async Task<IEnumerable<Notification>> GetUnreadByCustomerIdAsync(int customerId)
    {
        return await _dbSet
            .Where(n => n.CustomerId == customerId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(int customerId)
    {
        return await _dbSet
            .CountAsync(n => n.CustomerId == customerId && !n.IsRead);
    }

    public async Task MarkAsReadAsync(int notificationId)
    {
        var notification = await _dbSet.FindAsync(notificationId);
        if (notification != null)
        {
            notification.IsRead = true;
        }
    }

    public async Task MarkAllAsReadAsync(int customerId)
    {
        var notifications = await _dbSet
            .Where(n => n.CustomerId == customerId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }
    }
}
