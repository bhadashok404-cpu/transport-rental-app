using backend.Common;
using backend.DTOs.Payment;
using backend.Enums;

namespace backend.Services.Interfaces;

public interface IPaymentService
{
    Task<ServiceResult<PagedResult<PaymentDto>>> GetPagedPaymentsAsync(PaginationParams pagination, PaymentStatus? status = null);
    Task<ServiceResult<PaymentDto>> GetPaymentByIdAsync(int id);
    Task<ServiceResult<IEnumerable<PaymentDto>>> GetPaymentsByBookingIdAsync(int bookingId);
    Task<ServiceResult<IEnumerable<PaymentDto>>> GetPaymentsByCustomerIdAsync(int customerId);
    Task<ServiceResult<PaymentDto>> CreatePaymentAsync(CreatePaymentRequest request);
    Task<ServiceResult<PaymentDto>> ProcessPaymentAsync(int id, ProcessPaymentRequest request);
    Task<ServiceResult<PaymentDto>> RefundPaymentAsync(int id);
}
