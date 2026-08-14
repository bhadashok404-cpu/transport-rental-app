using backend.Common;
using backend.DTOs.VehicleCategory;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/vehicle-categories")]
public class VehicleCategoriesController : ControllerBase
{
    private readonly IVehicleCategoryService _vehicleCategoryService;

    public VehicleCategoriesController(IVehicleCategoryService vehicleCategoryService)
    {
        _vehicleCategoryService = vehicleCategoryService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<VehicleCategoryDto>>>> GetCategories()
    {
        var result = await _vehicleCategoryService.GetAllCategoriesAsync();
        
        return Ok(ApiResponse<IEnumerable<VehicleCategoryDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<IEnumerable<VehicleCategoryDto>>>> GetActiveCategories()
    {
        var result = await _vehicleCategoryService.GetActiveCategoriesAsync();
        
        return Ok(ApiResponse<IEnumerable<VehicleCategoryDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<VehicleCategoryDto>>> GetCategory(int id)
    {
        var result = await _vehicleCategoryService.GetCategoryByIdAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<VehicleCategoryDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<VehicleCategoryDto>.ErrorResponse(result.Message));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<VehicleCategoryDto>>> CreateCategory([FromBody] CreateVehicleCategoryRequest request)
    {
        var result = await _vehicleCategoryService.CreateCategoryAsync(request);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetCategory), new { id = result.Data!.Id }, 
                ApiResponse<VehicleCategoryDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<VehicleCategoryDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<VehicleCategoryDto>>> UpdateCategory(int id, [FromBody] UpdateVehicleCategoryRequest request)
    {
        var result = await _vehicleCategoryService.UpdateCategoryAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<VehicleCategoryDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<VehicleCategoryDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteCategory(int id)
    {
        var result = await _vehicleCategoryService.DeleteCategoryAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }
}