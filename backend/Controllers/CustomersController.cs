using backend.Common;
using backend.DTOs.Customer;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<PagedResult<CustomerDto>>>> GetCustomers(
        [FromQuery] PaginationParams pagination,
        [FromQuery] string? searchTerm = null)
    {
        var result = await _customerService.GetPagedCustomersAsync(pagination, searchTerm);
        
        return Ok(ApiResponse<PagedResult<CustomerDto>>.SuccessResponse(result.Data!, result.Message));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<CustomerDto>>> GetCustomer(int id)
    {
        var result = await _customerService.GetCustomerByIdAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<CustomerDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<CustomerDto>.ErrorResponse(result.Message));
    }

    [HttpGet("by-email/{email}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<CustomerDto>>> GetCustomerByEmail(string email)
    {
        var result = await _customerService.GetCustomerByEmailAsync(email);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<CustomerDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<CustomerDto>.ErrorResponse(result.Message));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<CustomerDto>>> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        var result = await _customerService.CreateCustomerAsync(request);
        
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetCustomer), new { id = result.Data!.Id }, 
                ApiResponse<CustomerDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<CustomerDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<ActionResult<ApiResponse<CustomerDto>>> UpdateCustomer(int id, [FromBody] UpdateCustomerRequest request)
    {
        var result = await _customerService.UpdateCustomerAsync(id, request);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<CustomerDto>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<CustomerDto>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteCustomer(int id)
    {
        var result = await _customerService.DeleteCustomerAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }

    [HttpPatch("{id:int}/verify")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> VerifyCustomer(int id)
    {
        var result = await _customerService.VerifyCustomerAsync(id);
        
        return result.IsSuccess 
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }
}