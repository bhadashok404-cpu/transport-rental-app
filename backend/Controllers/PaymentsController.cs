using backend.Common;
using backend.DTOs.Payment;
using backend.Enums;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IBookingService _bookingService;

    public PaymentsController(IPaymentService paymentService, IBookingService bookingService)
    {
        _paymentService = paymentService;
        _bookingService = bookingService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<PagedResult<PaymentDto>>>> GetPayments(
        [FromQuery] PaginationParams pagination,
        [FromQuery] PaymentStatus? status = null)
    {
        var result = await _paymentService.GetPagedPaymentsAsync(pagination, status);
        
        return Ok(ApiResponse<PagedResult<PaymentDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> GetPayment(int id)
    {
        var result = await _paymentService.GetPaymentByIdAsync(id);
        
        if (result.IsSuccess && User.IsInRole("Customer") && result.Data!.CustomerId != GetClaimId("customerId")) return Forbid();
        return result.IsSuccess 
            ? Ok(ApiResponse<PaymentDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<PaymentDto>.ErrorResponse(result.Message));
    }

    [HttpGet("booking/{bookingId:int}")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PaymentDto>>>> GetPaymentsByBooking(int bookingId)
    {
        var result = await _paymentService.GetPaymentsByBookingIdAsync(bookingId);
        if (User.IsInRole("Customer"))
        {
            var booking = await _bookingService.GetBookingByIdAsync(bookingId);
            if (!booking.IsSuccess || booking.Data!.CustomerId != GetClaimId("customerId")) return Forbid();
        }
        
        return Ok(ApiResponse<IEnumerable<PaymentDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("customer/{customerId:int}")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PaymentDto>>>> GetPaymentsByCustomer(int customerId)
    {
        if (User.IsInRole("Customer") && customerId != GetClaimId("customerId")) return Forbid();
        var result = await _paymentService.GetPaymentsByCustomerIdAsync(customerId);
        
        return Ok(ApiResponse<IEnumerable<PaymentDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        if (User.IsInRole("Customer"))
        {
            var booking = await _bookingService.GetBookingByIdAsync(request.BookingId);
            if (!booking.IsSuccess || booking.Data!.CustomerId != GetClaimId("customerId")) return Forbid();
        }
        var result = await _paymentService.CreatePaymentAsync(request);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetPayment), new { id = result.Data!.Id }, 
                ApiResponse<PaymentDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<PaymentDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/process")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> ProcessPayment(int id, [FromBody] ProcessPaymentRequest request)
    {
        if (User.IsInRole("Customer"))
        {
            var payment = await _paymentService.GetPaymentByIdAsync(id);
            if (!payment.IsSuccess || payment.Data!.CustomerId != GetClaimId("customerId")) return Forbid();
        }
        var result = await _paymentService.ProcessPaymentAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<PaymentDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<PaymentDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/refund")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> RefundPayment(int id)
    {
        var result = await _paymentService.RefundPaymentAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<PaymentDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<PaymentDto>.ErrorResponse(result.Message, result.Errors));
    }

    private int? GetClaimId(string claimType) => int.TryParse(User.FindFirst(claimType)?.Value, out var id) ? id : null;
}