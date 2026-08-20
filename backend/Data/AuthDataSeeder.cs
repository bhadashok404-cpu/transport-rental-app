using backend.Enums;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class AuthDataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        var hasher = new PasswordHasher<UserAccount>();
        var admin = await db.UserAccounts.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
        if (admin == null)
        {
            admin = new UserAccount { DisplayName = "Administrator", Email = "admin@riderental.com", Role = UserRole.Admin, IsActive = true };
            db.UserAccounts.Add(admin);
        }

        admin.Email = "admin@riderental.com";
        admin.DisplayName = string.IsNullOrWhiteSpace(admin.DisplayName) ? "Administrator" : admin.DisplayName;
        admin.IsActive = true;
        admin.PasswordHash = hasher.HashPassword(admin, "Admin123!");
        await db.SaveChangesAsync();
    }
}