using backend.Common;
using backend.Enums;
using backend.Models;

namespace backend.Repositories;

public interface IPaymentRepository : IRepository<Payment>
{
    Task<PagedResult<Payment>> GetPagedAsync(PaginationParams pagination, PaymentStatus? status = null);
    Task<Payment?> GetByTransactionIdAsync(string transactionId);
    Task<IEnumerable<Payment>> GetByBookingIdAsync(int bookingId);
    Task<IEnumerable<Payment>> GetByCustomerIdAsync(int customerId);
    Task<Payment?> GetByIdWithDetailsAsync(int id);
}
