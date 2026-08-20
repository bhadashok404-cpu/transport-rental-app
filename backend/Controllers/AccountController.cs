using System.Security.Claims;
using backend.Common;
using backend.Data;
using backend.DTOs.Account;
using backend.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/account")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly AppDbContext _db;

    public AccountController(AppDbContext db) => _db = db;

    [HttpGet("profile")]
    public async Task<ActionResult<ApiResponse<ProfileDto>>> GetProfile()
    {
        var account = await GetAccount();
        return account == null
            ? NotFound(ApiResponse<ProfileDto>.ErrorResponse("Account not found"))
            : Ok(ApiResponse<ProfileDto>.SuccessResponse(ToProfile(account)));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<ProfileDto>>> UpdateProfile(UpdateProfileRequest request)
    {
        var account = await GetAccount();
        if (account == null) return NotFound(ApiResponse<ProfileDto>.ErrorResponse("Account not found"));
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(ApiResponse<ProfileDto>.ErrorResponse("Name and email are required"));

        var email = request.Email.Trim().ToLowerInvariant();
        if (await _db.UserAccounts.AnyAsync(user => user.Email == email && user.Id != account.Id))
            return BadRequest(ApiResponse<ProfileDto>.ErrorResponse("Email is already registered"));

        account.Email = email;
        account.DisplayName = request.Name.Trim();
        if (account.Role == UserRole.Customer && account.Customer != null)
        {
            var names = request.Name.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
            account.Customer.FirstName = names[0];
            account.Customer.LastName = names.Length > 1 ? names[1] : string.Empty;
            account.Customer.Email = email;
            account.Customer.PhoneNumber = request.PhoneNumber.Trim();
            account.Customer.Address = request.Address.Trim();
            account.Customer.UpdatedAt = DateTime.UtcNow;
        }
        else if (account.Role == UserRole.Driver && account.Driver != null)
        {
            var names = request.Name.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
            account.Driver.FirstName = names[0];
            account.Driver.LastName = names.Length > 1 ? names[1] : string.Empty;
            account.Driver.Email = email;
            account.Driver.PhoneNumber = request.PhoneNumber.Trim();
            account.Driver.Address = request.Address.Trim();
            account.Driver.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<ProfileDto>.SuccessResponse(ToProfile(account), "Profile updated successfully"));
    }

    private async Task<Models.UserAccount?> GetAccount()
    {
        var subject = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(subject, out var id)
            ? await _db.UserAccounts.Include(user => user.Customer).Include(user => user.Driver).FirstOrDefaultAsync(user => user.Id == id)
            : null;
    }

    private static ProfileDto ToProfile(Models.UserAccount account)
    {
        return new ProfileDto
        {
            Id = account.Id,
            Name = string.IsNullOrWhiteSpace(account.DisplayName)
                ? account.Customer != null
                    ? $"{account.Customer.FirstName} {account.Customer.LastName}".Trim()
                    : account.Driver != null
                        ? $"{account.Driver.FirstName} {account.Driver.LastName}".Trim()
                        : "Administrator"
                : account.DisplayName,
            Email = account.Email,
            PhoneNumber = account.Customer?.PhoneNumber ?? account.Driver?.PhoneNumber ?? string.Empty,
            Address = account.Customer?.Address ?? account.Driver?.Address ?? string.Empty,
            Role = account.Role,
            CustomerId = account.CustomerId,
            DriverId = account.DriverId
        };
    }
}
