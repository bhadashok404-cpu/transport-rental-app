using backend.Common;
using backend.DTOs.Booking;
using backend.Enums;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<PagedResult<BookingDto>>>> GetBookings(
        [FromQuery] PaginationParams pagination,
        [FromQuery] BookingStatus? status = null)
    {
        var result = await _bookingService.GetPagedBookingsAsync(pagination, status);
        
        return Ok(ApiResponse<PagedResult<BookingDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Customer,Driver")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> GetBooking(int id)
    {
        var result = await _bookingService.GetBookingByIdAsync(id);
        
        if (result.IsSuccess && User.IsInRole("Customer") && !CanCustomerAccess(result.Data!.CustomerId))
            return Forbid();
        if (result.IsSuccess && User.IsInRole("Driver") && result.Data!.DriverId != GetClaimId("driverId"))
            return Forbid();
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<BookingDto>.ErrorResponse(result.Message));
    }

    [HttpGet("customer/{customerId:int}")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookingDto>>>> GetBookingsByCustomer(int customerId)
    {
        if (!CanCustomerAccess(customerId)) return Forbid();
        var result = await _bookingService.GetBookingsByCustomerIdAsync(customerId);
        
        return Ok(ApiResponse<IEnumerable<BookingDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("driver/{driverId:int}")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookingDto>>>> GetBookingsByDriver(int driverId)
    {
        var result = await _bookingService.GetBookingsByDriverIdAsync(driverId);
        
        return Ok(ApiResponse<IEnumerable<BookingDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("pending")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookingDto>>>> GetPendingBookings()
    {
        var result = await _bookingService.GetPendingBookingsAsync();
        
        return Ok(ApiResponse<IEnumerable<BookingDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("active")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookingDto>>>> GetActiveBookings()
    {
        var result = await _bookingService.GetActiveBookingsAsync();
        
        return Ok(ApiResponse<IEnumerable<BookingDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> CreateBooking([FromBody] CreateBookingRequest request)
    {
        if (User.IsInRole("Customer"))
        {
            var customerId = GetClaimId("customerId");
            if (!customerId.HasValue) return Forbid();
            request.CustomerId = customerId.Value;
        }
        var result = await _bookingService.CreateBookingAsync(request);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetBooking), new { id = result.Data!.Id }, 
                ApiResponse<BookingDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> UpdateBooking(int id, [FromBody] UpdateBookingRequest request)
    {
        var existing = await _bookingService.GetBookingByIdAsync(id);
        if (!existing.IsSuccess || (User.IsInRole("Customer") && !CanCustomerAccess(existing.Data!.CustomerId))) return Forbid();
        var result = await _bookingService.UpdateBookingAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/cancel")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<object>>> CancelBooking(int id, [FromBody] CancelBookingRequest request)
    {
        var existing = await _bookingService.GetBookingByIdAsync(id);
        if (!existing.IsSuccess || (User.IsInRole("Customer") && !CanCustomerAccess(existing.Data!.CustomerId))) return Forbid();
        var result = await _bookingService.CancelBookingAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/assign-driver")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> AssignDriver(int id, [FromBody] AssignDriverRequest request)
    {
        var result = await _bookingService.AssignDriverAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/start-trip")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> StartTrip(int id)
    {
        var result = await _bookingService.StartTripAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/complete-trip")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> CompleteTrip(int id, [FromQuery] decimal actualDistance)
    {
        var result = await _bookingService.CompleteTripAsync(id, actualDistance);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> UpdateStatus(int id, [FromQuery] BookingStatus status)
    {
        var result = await _bookingService.UpdateBookingStatusAsync(id, status);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpGet("driver/{driverId:int}/requests")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<IEnumerable<RideRequestDto>>>> GetDriverRequests(int driverId)
    {
        if (!CanDriverAccess(driverId))
            return Forbid();
        var result = await _bookingService.GetDriverRideRequestsAsync(driverId);
        return Ok(ApiResponse<IEnumerable<RideRequestDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("ride-requests")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<RideRequestDto>>>> GetAllRideRequests()
    {
        var result = await _bookingService.GetAllRideRequestsAsync();
        return Ok(ApiResponse<IEnumerable<RideRequestDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpPatch("requests/{requestId:int}/respond")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<RideRequestDto>>> RespondToRequest(int requestId, [FromQuery] int driverId, [FromQuery] bool accept)
    {
        if (!CanDriverAccess(driverId))
            return Forbid();
        var result = await _bookingService.RespondToRideRequestAsync(requestId, driverId, accept);
        return result.IsSuccess
            ? Ok(ApiResponse<RideRequestDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<RideRequestDto>.ErrorResponse(result.Message, result.Errors));
    }

    private bool CanDriverAccess(int driverId)
    {
        if (User.IsInRole("Admin")) return true;
        return int.TryParse(User.FindFirst("driverId")?.Value, out var tokenDriverId) && tokenDriverId == driverId;
    }

    private bool CanCustomerAccess(int customerId) => User.IsInRole("Admin") || GetClaimId("customerId") == customerId;

    private int? GetClaimId(string claimType) =>
        int.TryParse(User.FindFirst(claimType)?.Value, out var id) ? id : null;
}