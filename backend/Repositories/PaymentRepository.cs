using backend.Common;
using backend.Data;
using backend.Enums;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class PaymentRepository : Repository<Payment>, IPaymentRepository
{
    public PaymentRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<PagedResult<Payment>> GetPagedAsync(PaginationParams pagination, PaymentStatus? status = null)
    {
        var query = _dbSet
            .Include(p => p.Customer)
            .Include(p => p.Booking)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<Payment>.Create(items, totalCount, pagination.Page, pagination.PageSize);
    }

    public async Task<Payment?> GetByTransactionIdAsync(string transactionId)
    {
        return await _dbSet
            .Include(p => p.Customer)
            .Include(p => p.Booking)
            .FirstOrDefaultAsync(p => p.TransactionId == transactionId);
    }

    public async Task<IEnumerable<Payment>> GetByBookingIdAsync(int bookingId)
    {
        return await _dbSet
            .Where(p => p.BookingId == bookingId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Payment>> GetByCustomerIdAsync(int customerId)
    {
        return await _dbSet
            .Include(p => p.Booking)
            .Where(p => p.CustomerId == customerId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Payment?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(p => p.Customer)
            .Include(p => p.Booking!)
                .ThenInclude(b => b!.Vehicle)
            .FirstOrDefaultAsync(p => p.Id == id);
    }
}
