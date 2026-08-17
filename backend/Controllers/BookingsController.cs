using backend.Common;
using backend.DTOs.Booking;
using backend.Enums;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

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
    public async Task<ActionResult<ApiResponse<PagedResult<BookingDto>>>> GetBookings(
        [FromQuery] PaginationParams pagination,
        [FromQuery] BookingStatus? status = null)
    {
        var result = await _bookingService.GetPagedBookingsAsync(pagination, status);
        
        return Ok(ApiResponse<PagedResult<BookingDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> GetBooking(int id)
    {
        var result = await _bookingService.GetBookingByIdAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<BookingDto>.ErrorResponse(result.Message));
    }

    [HttpGet("customer/{customerId:int}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookingDto>>>> GetBookingsByCustomer(int customerId)
    {
        var result = await _bookingService.GetBookingsByCustomerIdAsync(customerId);
        
        return Ok(ApiResponse<IEnumerable<BookingDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("driver/{driverId:int}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookingDto>>>> GetBookingsByDriver(int driverId)
    {
        var result = await _bookingService.GetBookingsByDriverIdAsync(driverId);
        
        return Ok(ApiResponse<IEnumerable<BookingDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("pending")]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookingDto>>>> GetPendingBookings()
    {
        var result = await _bookingService.GetPendingBookingsAsync();
        
        return Ok(ApiResponse<IEnumerable<BookingDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookingDto>>>> GetActiveBookings()
    {
        var result = await _bookingService.GetActiveBookingsAsync();
        
        return Ok(ApiResponse<IEnumerable<BookingDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<BookingDto>>> CreateBooking([FromBody] CreateBookingRequest request)
    {
        var result = await _bookingService.CreateBookingAsync(request);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetBooking), new { id = result.Data!.Id }, 
                ApiResponse<BookingDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> UpdateBooking(int id, [FromBody] UpdateBookingRequest request)
    {
        var result = await _bookingService.UpdateBookingAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/cancel")]
    public async Task<ActionResult<ApiResponse<object>>> CancelBooking(int id, [FromBody] CancelBookingRequest request)
    {
        var result = await _bookingService.CancelBookingAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/assign-driver")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> AssignDriver(int id, [FromBody] AssignDriverRequest request)
    {
        var result = await _bookingService.AssignDriverAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/start-trip")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> StartTrip(int id)
    {
        var result = await _bookingService.StartTripAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/complete-trip")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> CompleteTrip(int id, [FromQuery] decimal actualDistance)
    {
        var result = await _bookingService.CompleteTripAsync(id, actualDistance);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> UpdateStatus(int id, [FromQuery] BookingStatus status)
    {
        var result = await _bookingService.UpdateBookingStatusAsync(id, status);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<BookingDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Message, result.Errors));
    }
}