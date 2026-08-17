using backend.Common;
using backend.Data;
using backend.Enums;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class DriverRepository : Repository<Driver>, IDriverRepository
{
    public DriverRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<PagedResult<Driver>> GetPagedAsync(PaginationParams pagination, string? searchTerm = null)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(d =>
                d.FirstName.Contains(searchTerm) ||
                d.LastName.Contains(searchTerm) ||
                d.Email.Contains(searchTerm) ||
                d.PhoneNumber.Contains(searchTerm) ||
                d.LicenseNumber.Contains(searchTerm));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(d => d.Rating)
            .ThenBy(d => d.LastName)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<Driver>.Create(items, totalCount, pagination.Page, pagination.PageSize);
    }

    public async Task<IEnumerable<Driver>> GetAvailableDriversAsync()
    {
        return await _dbSet
            .Where(d => d.Status == DriverStatus.Available && d.IsActive && d.IsVerified)
            .OrderByDescending(d => d.Rating)
            .ToListAsync();
    }

    public async Task<Driver?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(d => d.Email == email);
    }

    public async Task<Driver?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(d => d.Bookings)
            .Include(d => d.Reviews)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<IEnumerable<Driver>> GetDriversByStatusAsync(DriverStatus status)
    {
        return await _dbSet
            .Where(d => d.Status == status)
            .ToListAsync();
    }
}
