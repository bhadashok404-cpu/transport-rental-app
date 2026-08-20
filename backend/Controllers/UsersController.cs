using backend.Common;
using backend.Data;
using backend.DTOs.User;
using backend.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<UserDirectoryDto>>> GetUsers(
        [FromQuery] PaginationParams pagination,
        [FromQuery] string? searchTerm = null,
        [FromQuery] UserRole? role = null)
    {
        var query = _db.UserAccounts
            .AsNoTracking()
            .Include(user => user.Customer)
            .Include(user => user.Driver)
            .AsQueryable();

        if (role.HasValue)
            query = query.Where(user => user.Role == role.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim();
            query = query.Where(user => user.Email.Contains(term)
                || (user.Customer != null && (user.Customer.FirstName.Contains(term) || user.Customer.LastName.Contains(term)))
                || (user.Driver != null && (user.Driver.FirstName.Contains(term) || user.Driver.LastName.Contains(term))));
        }

        var totalUsers = await _db.UserAccounts.CountAsync();
        var adminCount = await _db.UserAccounts.CountAsync(user => user.Role == UserRole.Admin);
        var customerCount = await _db.UserAccounts.CountAsync(user => user.Role == UserRole.Customer);
        var driverCount = await _db.UserAccounts.CountAsync(user => user.Role == UserRole.Driver);
        var totalCount = await query.CountAsync();

        var accounts = await query
            .OrderByDescending(user => user.CreatedAt)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync();

        var users = accounts.Select(user => new UserSummaryDto
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email,
            Name = user.Customer != null
                ? $"{user.Customer.FirstName} {user.Customer.LastName}".Trim()
                : user.Driver != null
                    ? $"{user.Driver.FirstName} {user.Driver.LastName}".Trim()
                    : string.IsNullOrWhiteSpace(user.DisplayName) ? "Administrator" : user.DisplayName,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        }).ToList();

        var directory = new UserDirectoryDto
        {
            Users = PagedResult<UserSummaryDto>.Create(users, totalCount, pagination.Page, pagination.PageSize),
            TotalUsers = totalUsers,
            AdminCount = adminCount,
            CustomerCount = customerCount,
            DriverCount = driverCount
        };

        return Ok(ApiResponse<UserDirectoryDto>.SuccessResponse(directory, "Users loaded successfully"));
    }
}
