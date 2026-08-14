using backend.Common;
using backend.DTOs.Review;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ReviewDto>>>> GetReviews(
        [FromQuery] PaginationParams pagination)
    {
        var result = await _reviewService.GetPagedReviewsAsync(pagination);
        
        return Ok(ApiResponse<PagedResult<ReviewDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ReviewDto>>> GetReview(int id)
    {
        var result = await _reviewService.GetReviewByIdAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<ReviewDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<ReviewDto>.ErrorResponse(result.Message));
    }

    [HttpGet("booking/{bookingId:int}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReviewDto>>>> GetReviewsByBooking(int bookingId)
    {
        var result = await _reviewService.GetReviewsByBookingIdAsync(bookingId);
        
        return Ok(ApiResponse<IEnumerable<ReviewDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("customer/{customerId:int}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReviewDto>>>> GetReviewsByCustomer(int customerId)
    {
        var result = await _reviewService.GetReviewsByCustomerIdAsync(customerId);
        
        return Ok(ApiResponse<IEnumerable<ReviewDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("driver/{driverId:int}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReviewDto>>>> GetReviewsByDriver(int driverId)
    {
        var result = await _reviewService.GetReviewsByDriverIdAsync(driverId);
        
        return Ok(ApiResponse<IEnumerable<ReviewDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("vehicle/{vehicleId:int}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReviewDto>>>> GetReviewsByVehicle(int vehicleId)
    {
        var result = await _reviewService.GetReviewsByVehicleIdAsync(vehicleId);
        
        return Ok(ApiResponse<IEnumerable<ReviewDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ReviewDto>>> CreateReview([FromBody] CreateReviewRequest request)
    {
        var result = await _reviewService.CreateReviewAsync(request);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetReview), new { id = result.Data!.Id }, 
                ApiResponse<ReviewDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<ReviewDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteReview(int id)
    {
        var result = await _reviewService.DeleteReviewAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }
}