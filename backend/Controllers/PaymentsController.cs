using backend.Common;
using backend.DTOs.Payment;
using backend.Enums;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<PaymentDto>>>> GetPayments(
        [FromQuery] PaginationParams pagination,
        [FromQuery] PaymentStatus? status = null)
    {
        var result = await _paymentService.GetPagedPaymentsAsync(pagination, status);
        
        return Ok(ApiResponse<PagedResult<PaymentDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> GetPayment(int id)
    {
        var result = await _paymentService.GetPaymentByIdAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<PaymentDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<PaymentDto>.ErrorResponse(result.Message));
    }

    [HttpGet("booking/{bookingId:int}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PaymentDto>>>> GetPaymentsByBooking(int bookingId)
    {
        var result = await _paymentService.GetPaymentsByBookingIdAsync(bookingId);
        
        return Ok(ApiResponse<IEnumerable<PaymentDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("customer/{customerId:int}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PaymentDto>>>> GetPaymentsByCustomer(int customerId)
    {
        var result = await _paymentService.GetPaymentsByCustomerIdAsync(customerId);
        
        return Ok(ApiResponse<IEnumerable<PaymentDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        var result = await _paymentService.CreatePaymentAsync(request);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetPayment), new { id = result.Data!.Id }, 
                ApiResponse<PaymentDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<PaymentDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/process")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> ProcessPayment(int id, [FromBody] ProcessPaymentRequest request)
    {
        var result = await _paymentService.ProcessPaymentAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<PaymentDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<PaymentDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/refund")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> RefundPayment(int id)
    {
        var result = await _paymentService.RefundPaymentAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<PaymentDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<PaymentDto>.ErrorResponse(result.Message, result.Errors));
    }
}