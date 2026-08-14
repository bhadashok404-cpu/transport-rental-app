using backend.Common;
using backend.DTOs.Vehicle;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<VehicleDto>>>> GetVehicles(
        [FromQuery] PaginationParams pagination,
        [FromQuery] string? searchTerm = null)
    {
        var result = await _vehicleService.GetPagedVehiclesAsync(pagination, searchTerm);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<PagedResult<VehicleDto>>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<PagedResult<VehicleDto>>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<VehicleDto>>> GetVehicle(int id)
    {
        var result = await _vehicleService.GetVehicleByIdAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<VehicleDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<VehicleDto>.ErrorResponse(result.Message));
    }

    [HttpGet("available")]
    public async Task<ActionResult<ApiResponse<IEnumerable<VehicleDto>>>> GetAvailableVehicles()
    {
        var result = await _vehicleService.GetAvailableVehiclesAsync();
        
        return Ok(ApiResponse<IEnumerable<VehicleDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("category/{categoryId:int}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<VehicleDto>>>> GetVehiclesByCategory(int categoryId)
    {
        var result = await _vehicleService.GetVehiclesByCategoryAsync(categoryId);
        
        return Ok(ApiResponse<IEnumerable<VehicleDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<VehicleDto>>> CreateVehicle([FromBody] CreateVehicleRequest request)
    {
        var result = await _vehicleService.CreateVehicleAsync(request);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetVehicle), new { id = result.Data!.Id }, 
                ApiResponse<VehicleDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<VehicleDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<VehicleDto>>> UpdateVehicle(int id, [FromBody] UpdateVehicleRequest request)
    {
        var result = await _vehicleService.UpdateVehicleAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<VehicleDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<VehicleDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteVehicle(int id)
    {
        var result = await _vehicleService.DeleteVehicleAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/toggle-availability")]
    public async Task<ActionResult<ApiResponse<object>>> ToggleAvailability(int id)
    {
        var result = await _vehicleService.ToggleAvailabilityAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }
}