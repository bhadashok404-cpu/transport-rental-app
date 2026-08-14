using backend.Common;
using backend.DTOs.Notification;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet("customer/{customerId:int}")]
    public async Task<ActionResult<ApiResponse<PagedResult<NotificationDto>>>> GetNotificationsByCustomer(
        int customerId, 
        [FromQuery] PaginationParams pagination)
    {
        var result = await _notificationService.GetPagedNotificationsByCustomerIdAsync(customerId, pagination);
        
        return Ok(ApiResponse<PagedResult<NotificationDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("customer/{customerId:int}/unread")]
    public async Task<ActionResult<ApiResponse<IEnumerable<NotificationDto>>>> GetUnreadNotificationsByCustomer(int customerId)
    {
        var result = await _notificationService.GetUnreadNotificationsByCustomerIdAsync(customerId);
        
        return Ok(ApiResponse<IEnumerable<NotificationDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("customer/{customerId:int}/unread-count")]
    public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount(int customerId)
    {
        var result = await _notificationService.GetUnreadCountAsync(customerId);
        
        return Ok(ApiResponse<int>.SuccessResponse(result.Data, result.Message));
    }

    [HttpPatch("{id:int}/mark-read")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsRead(int id)
    {
        var result = await _notificationService.MarkAsReadAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("customer/{customerId:int}/mark-all-read")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAllAsRead(int customerId)
    {
        var result = await _notificationService.MarkAllAsReadAsync(customerId);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }
}