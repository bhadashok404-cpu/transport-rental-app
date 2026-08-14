using backend.Common;
using backend.DTOs.Customer;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;

namespace backend.Services.Implementations;

public class CustomerService : ICustomerService
{
    private readonly IUnitOfWork _unitOfWork;

    public CustomerService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<PagedResult<CustomerDto>>> GetPagedCustomersAsync(PaginationParams pagination, string? searchTerm = null)
    {
        var pagedCustomers = await _unitOfWork.Customers.GetPagedAsync(pagination, searchTerm);
        var dtos = pagedCustomers.Items.Select(c => c.ToDto()).ToList();

        var result = PagedResult<CustomerDto>.Create(dtos, pagedCustomers.TotalCount, pagedCustomers.Page, pagedCustomers.PageSize);
        return ServiceResult<PagedResult<CustomerDto>>.Success(result);
    }

    public async Task<ServiceResult<CustomerDto>> GetCustomerByIdAsync(int id)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null)
            return ServiceResult<CustomerDto>.Failure("Customer not found");

        return ServiceResult<CustomerDto>.Success(customer.ToDto());
    }

    public async Task<ServiceResult<CustomerDto>> GetCustomerByEmailAsync(string email)
    {
        var customer = await _unitOfWork.Customers.GetByEmailAsync(email);
        if (customer == null)
            return ServiceResult<CustomerDto>.Failure("Customer not found");

        return ServiceResult<CustomerDto>.Success(customer.ToDto());
    }

    public async Task<ServiceResult<CustomerDto>> CreateCustomerAsync(CreateCustomerRequest request)
    {
        var existingCustomer = await _unitOfWork.Customers.GetByEmailAsync(request.Email);
        if (existingCustomer != null)
            return ServiceResult<CustomerDto>.Failure("Email already exists");

        var customer = new Customer
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Address = request.Address,
            ProfileImageUrl = request.ProfileImageUrl,
            IsVerified = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Customers.AddAsync(customer);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<CustomerDto>.Success(customer.ToDto(), "Customer created successfully");
    }

    public async Task<ServiceResult<CustomerDto>> UpdateCustomerAsync(int id, UpdateCustomerRequest request)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null)
            return ServiceResult<CustomerDto>.Failure("Customer not found");

        var emailExists = await _unitOfWork.Customers.ExistsAsync(c => c.Email == request.Email && c.Id != id);
        if (emailExists)
            return ServiceResult<CustomerDto>.Failure("Email already exists");

        customer.FirstName = request.FirstName;
        customer.LastName = request.LastName;
        customer.Email = request.Email;
        customer.PhoneNumber = request.PhoneNumber;
        customer.Address = request.Address;
        customer.ProfileImageUrl = request.ProfileImageUrl;
        customer.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Customers.Update(customer);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<CustomerDto>.Success(customer.ToDto(), "Customer updated successfully");
    }

    public async Task<ServiceResult> DeleteCustomerAsync(int id)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null)
            return ServiceResult.Failure("Customer not found");

        _unitOfWork.Customers.Remove(customer);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success("Customer deleted successfully");
    }

    public async Task<ServiceResult> VerifyCustomerAsync(int id)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null)
            return ServiceResult.Failure("Customer not found");

        customer.IsVerified = true;
        customer.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Customers.Update(customer);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success("Customer verified successfully");
    }
}
