using backend.Common;
using backend.DTOs.Notification;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;

namespace backend.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<PagedResult<NotificationDto>>> GetPagedNotificationsByCustomerIdAsync(int customerId, PaginationParams pagination)
    {
        var pagedNotifications = await _unitOfWork.Notifications.GetPagedByCustomerIdAsync(customerId, pagination);
        var dtos = pagedNotifications.Items.Select(n => n.ToDto()).ToList();

        var result = PagedResult<NotificationDto>.Create(dtos, pagedNotifications.TotalCount, pagedNotifications.Page, pagedNotifications.PageSize);
        return ServiceResult<PagedResult<NotificationDto>>.Success(result);
    }

    public async Task<ServiceResult<IEnumerable<NotificationDto>>> GetUnreadNotificationsByCustomerIdAsync(int customerId)
    {
        var notifications = await _unitOfWork.Notifications.GetUnreadByCustomerIdAsync(customerId);
        var dtos = notifications.Select(n => n.ToDto());
        return ServiceResult<IEnumerable<NotificationDto>>.Success(dtos);
    }

    public async Task<ServiceResult<int>> GetUnreadCountAsync(int customerId)
    {
        var count = await _unitOfWork.Notifications.GetUnreadCountAsync(customerId);
        return ServiceResult<int>.Success(count);
    }

    public async Task<ServiceResult> MarkAsReadAsync(int notificationId)
    {
        await _unitOfWork.Notifications.MarkAsReadAsync(notificationId);
        await _unitOfWork.SaveChangesAsync();
        return ServiceResult.Success("Notification marked as read");
    }

    public async Task<ServiceResult> MarkAllAsReadAsync(int customerId)
    {
        await _unitOfWork.Notifications.MarkAllAsReadAsync(customerId);
        await _unitOfWork.SaveChangesAsync();
        return ServiceResult.Success("All notifications marked as read");
    }

    public async Task<ServiceResult<NotificationDto>> CreateNotificationAsync(CreateNotificationRequest request)
    {
        var notification = new Notification
        {
            CustomerId = request.CustomerId,
            Type = request.Type,
            Title = request.Title,
            Message = request.Message,
            BookingId = request.BookingId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(notification);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<NotificationDto>.Success(notification.ToDto(), "Notification created");
    }
}
