using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Common;
using backend.Data;
using backend.DTOs.Auth;
using backend.Enums;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly PasswordHasher<UserAccount> _hasher = new();

    public AuthService(AppDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    public async Task<ServiceResult<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            return ServiceResult<AuthResponse>.Failure("Password must be at least 8 characters");

        var email = request.Email.Trim().ToLowerInvariant();
        if (request.Role == UserRole.Admin)
            return ServiceResult<AuthResponse>.Failure("Admin accounts can only be created by the system administrator");

        if (await _db.UserAccounts.AnyAsync(u => u.Email == email))
            return ServiceResult<AuthResponse>.Failure("Email is already registered");

        UserAccount account;
        string fullName;
        if (request.Role == UserRole.Driver)
        {
            if (string.IsNullOrWhiteSpace(request.LicenseNumber) || !request.LicenseExpiryDate.HasValue)
                return ServiceResult<AuthResponse>.Failure("Driver license number and expiry date are required");

            var driver = await _db.Drivers.FirstOrDefaultAsync(d => d.Email == email) ?? new Driver();
            driver.FirstName = request.FirstName.Trim();
            driver.LastName = request.LastName.Trim();
            driver.Email = email;
            driver.PhoneNumber = request.PhoneNumber.Trim();
            driver.Address = request.Address.Trim();
            driver.LicenseNumber = request.LicenseNumber.Trim();
            driver.LicenseExpiryDate = request.LicenseExpiryDate.Value;
            driver.IsActive = true;
            driver.IsVerified = false;
            driver.Status = DriverStatus.Offline;
            if (driver.CreatedAt == default) driver.CreatedAt = DateTime.UtcNow;
            account = new UserAccount { DisplayName = $"{driver.FirstName} {driver.LastName}".Trim(), Email = email, Role = UserRole.Driver, Driver = driver };
            fullName = $"{driver.FirstName} {driver.LastName}";
        }
        else
        {
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Email == email) ?? new Customer();
            customer.FirstName = request.FirstName.Trim();
            customer.LastName = request.LastName.Trim();
            customer.Email = email;
            customer.PhoneNumber = request.PhoneNumber.Trim();
            customer.Address = request.Address.Trim();
            customer.IsActive = true;
            if (customer.CreatedAt == default) customer.CreatedAt = DateTime.UtcNow;
            account = new UserAccount { DisplayName = $"{customer.FirstName} {customer.LastName}".Trim(), Email = email, Role = UserRole.Customer, Customer = customer };
            fullName = $"{customer.FirstName} {customer.LastName}";
        }
        account.PasswordHash = _hasher.HashPassword(account, request.Password);
        _db.UserAccounts.Add(account);
        await _db.SaveChangesAsync();
        return ServiceResult<AuthResponse>.Success(CreateResponse(account, fullName), "Account created successfully");
    }

    public async Task<ServiceResult> CreateAdminAsync(CreateAdminRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ServiceResult.Failure("Admin name is required");
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            return ServiceResult.Failure("Password must be at least 8 characters");

        var email = request.Email.Trim().ToLowerInvariant();
        if (await _db.UserAccounts.AnyAsync(user => user.Email == email))
            return ServiceResult.Failure("Email is already registered");

        var account = new UserAccount
        {
            DisplayName = request.Name.Trim(),
            Email = email,
            Role = UserRole.Admin,
            IsActive = true,
            PasswordHash = _hasher.HashPassword(new UserAccount(), request.Password)
        };
        _db.UserAccounts.Add(account);
        await _db.SaveChangesAsync();
        return ServiceResult.Success("Admin account created successfully");
    }

    public async Task<ServiceResult> ResetPasswordAsync(ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
            return ServiceResult.Failure("Password must be at least 8 characters");

        var email = request.Email.Trim().ToLowerInvariant();
        var account = await _db.UserAccounts.FirstOrDefaultAsync(user => user.Email == email && user.Role == request.Role && user.IsActive);
        if (account == null)
            return ServiceResult.Failure("No active account matches that email and role");

        account.PasswordHash = _hasher.HashPassword(account, request.NewPassword);
        await _db.SaveChangesAsync();
        return ServiceResult.Success("Password reset successfully");
    }

    public async Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var account = await _db.UserAccounts.Include(u => u.Customer).Include(u => u.Driver)
            .FirstOrDefaultAsync(u => u.Email == email && u.Role == request.Role && u.IsActive);
        if (account == null || _hasher.VerifyHashedPassword(account, account.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            return ServiceResult<AuthResponse>.Failure("Invalid email or password");

        var fullName = account.Customer != null
            ? $"{account.Customer.FirstName} {account.Customer.LastName}"
            : account.Driver != null ? $"{account.Driver.FirstName} {account.Driver.LastName}" : string.IsNullOrWhiteSpace(account.DisplayName) ? "Administrator" : account.DisplayName;
        return ServiceResult<AuthResponse>.Success(CreateResponse(account, fullName), "Login successful");
    }

    private AuthResponse CreateResponse(UserAccount account, string fullName)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, account.Id.ToString()),
            new Claim(ClaimTypes.Email, account.Email),
            new Claim(ClaimTypes.Role, account.Role.ToString()),
            new Claim("customerId", account.CustomerId?.ToString() ?? string.Empty),
            new Claim("driverId", account.DriverId?.ToString() ?? string.Empty)
        };
        var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddHours(12), signingCredentials: credentials);
        return new AuthResponse
        {
            UserId = account.Id, Email = account.Email, FullName = fullName, Role = account.Role,
            CustomerId = account.CustomerId, DriverId = account.DriverId,
            Token = new JwtSecurityTokenHandler().WriteToken(token)
        };
    }
}