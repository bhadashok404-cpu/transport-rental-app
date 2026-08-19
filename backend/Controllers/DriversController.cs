using backend.Common;
using backend.DTOs.Driver;
using backend.Enums;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DriversController : ControllerBase
{
    private readonly IDriverService _driverService;

    public DriversController(IDriverService driverService)
    {
        _driverService = driverService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<PagedResult<DriverDto>>>> GetDrivers(
        [FromQuery] PaginationParams pagination,
        [FromQuery] string? searchTerm = null)
    {
        var result = await _driverService.GetPagedDriversAsync(pagination, searchTerm);
        
        return Ok(ApiResponse<PagedResult<DriverDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<DriverDto>>> GetDriver(int id)
    {
        var result = await _driverService.GetDriverByIdAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<DriverDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<DriverDto>.ErrorResponse(result.Message));
    }

    [HttpGet("available")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<DriverDto>>>> GetAvailableDrivers()
    {
        var result = await _driverService.GetAvailableDriversAsync();
        
        return Ok(ApiResponse<IEnumerable<DriverDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DriverDto>>> CreateDriver([FromBody] CreateDriverRequest request)
    {
        var result = await _driverService.CreateDriverAsync(request);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetDriver), new { id = result.Data!.Id }, 
                ApiResponse<DriverDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<DriverDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<DriverDto>>> UpdateDriver(int id, [FromBody] UpdateDriverRequest request)
    {
        var result = await _driverService.UpdateDriverAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<DriverDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<DriverDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteDriver(int id)
    {
        var result = await _driverService.DeleteDriverAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateDriverStatus(int id, [FromQuery] DriverStatus status)
    {
        var result = await _driverService.UpdateDriverStatusAsync(id, status);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/verify")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> VerifyDriver(int id)
    {
        var result = await _driverService.VerifyDriverAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }
}