using backend.Common;
using backend.DTOs.CarpoolBooking;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/carpool-bookings")]
public class CarpoolBookingsController : ControllerBase
{
    private readonly ICarpoolBookingService _carpoolBookingService;

    public CarpoolBookingsController(ICarpoolBookingService carpoolBookingService)
    {
        _carpoolBookingService = carpoolBookingService;
    }

    /// <summary>
    /// Passenger books one or more seats on a ride offer.
    /// Creates a Pending payment record; payment must be completed separately.
    /// POST /api/carpool-bookings
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<ApiResponse<CarpoolBookingDto>>> Book([FromBody] CreateCarpoolBookingRequest request)
    {
        var customerId = GetClaimId("customerId");
        if (!customerId.HasValue)
            return Forbid();

        // Always take CustomerId from JWT
        request.CustomerId = customerId.Value;

        var result = await _carpoolBookingService.BookSeatAsync(request);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id },
                ApiResponse<CarpoolBookingDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<CarpoolBookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    /// <summary>
    /// Get a single carpool booking by ID.
    /// Customer can only see their own; Admin can see all.
    /// GET /api/carpool-bookings/{id}
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<CarpoolBookingDto>>> GetById(int id)
    {
        bool isAdmin = User.IsInRole("Admin");
        int customerId = GetClaimId("customerId") ?? 0;

        var result = await _carpoolBookingService.GetByIdAsync(id, customerId, isAdmin);
        return result.IsSuccess
            ? Ok(ApiResponse<CarpoolBookingDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<CarpoolBookingDto>.ErrorResponse(result.Message));
    }

    /// <summary>
    /// All carpool bookings for the authenticated customer.
    /// GET /api/carpool-bookings/my
    /// </summary>
    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CarpoolBookingDto>>>> GetMyBookings()
    {
        var customerId = GetClaimId("customerId");
        if (!customerId.HasValue)
            return Forbid();

        var result = await _carpoolBookingService.GetPassengerBookingsAsync(customerId.Value);
        return result.IsSuccess
            ? Ok(ApiResponse<IEnumerable<CarpoolBookingDto>>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<IEnumerable<CarpoolBookingDto>>.ErrorResponse(result.Message, result.Errors));
    }

    /// <summary>
    /// All carpool bookings for a specific customer (Admin only).
    /// GET /api/carpool-bookings/customer/{customerId}
    /// </summary>
    [HttpGet("customer/{customerId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CarpoolBookingDto>>>> GetByCustomer(int customerId)
    {
        var result = await _carpoolBookingService.GetPassengerBookingsAsync(customerId);
        return result.IsSuccess
            ? Ok(ApiResponse<IEnumerable<CarpoolBookingDto>>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<IEnumerable<CarpoolBookingDto>>.ErrorResponse(result.Message, result.Errors));
    }

    /// <summary>
    /// Confirm a pending carpool booking (Admin or driver-side approval flow).
    /// PATCH /api/carpool-bookings/{id}/confirm
    /// </summary>
    [HttpPatch("{id:int}/confirm")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<CarpoolBookingDto>>> Confirm(int id)
    {
        var result = await _carpoolBookingService.ConfirmBookingAsync(id);
        return result.IsSuccess
            ? Ok(ApiResponse<CarpoolBookingDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<CarpoolBookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    /// <summary>
    /// Cancel a carpool booking. Passenger cancels their own; Admin can cancel any.
    /// PATCH /api/carpool-bookings/{id}/cancel
    /// </summary>
    [HttpPatch("{id:int}/cancel")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<object>>> Cancel(int id)
    {
        bool isAdmin = User.IsInRole("Admin");
        int customerId = GetClaimId("customerId") ?? 0;

        var result = await _carpoolBookingService.CancelBookingAsync(id, customerId, isAdmin);
        return result.IsSuccess
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private int? GetClaimId(string claimType) =>
        int.TryParse(User.FindFirst(claimType)?.Value, out var id) ? id : null;
}
