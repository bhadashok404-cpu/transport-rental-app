using backend.Common;
using backend.DTOs.Coupon;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<CouponDto>>>> GetCoupons()
    {
        var result = await _couponService.GetAllCouponsAsync();
        
        return Ok(ApiResponse<IEnumerable<CouponDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CouponDto>>>> GetActiveCoupons()
    {
        var result = await _couponService.GetActiveCouponsAsync();
        
        return Ok(ApiResponse<IEnumerable<CouponDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<CouponDto>>> GetCoupon(int id)
    {
        var result = await _couponService.GetCouponByIdAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<CouponDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<CouponDto>.ErrorResponse(result.Message));
    }

    [HttpGet("by-code/{code}")]
    public async Task<ActionResult<ApiResponse<CouponDto>>> GetCouponByCode(string code)
    {
        var result = await _couponService.GetCouponByCodeAsync(code);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<CouponDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<CouponDto>.ErrorResponse(result.Message));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CouponDto>>> CreateCoupon([FromBody] CreateCouponRequest request)
    {
        var result = await _couponService.CreateCouponAsync(request);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetCoupon), new { id = result.Data!.Id }, 
                ApiResponse<CouponDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<CouponDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPost("validate")]
    public async Task<ActionResult<ApiResponse<CouponDto>>> ValidateCoupon([FromBody] ValidateCouponRequest request)
    {
        var result = await _couponService.ValidateCouponAsync(request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<CouponDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<CouponDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteCoupon(int id)
    {
        var result = await _couponService.DeleteCouponAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }
}