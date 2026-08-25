using backend.Common;
using backend.DTOs.Payment;
using backend.Enums;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations;

public class PaymentService : IPaymentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly Data.AppDbContext _db;

    public PaymentService(IUnitOfWork unitOfWork, INotificationService notificationService, Data.AppDbContext db)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _db = db;
    }

    public async Task<ServiceResult<PagedResult<PaymentDto>>> GetPagedPaymentsAsync(PaginationParams pagination, PaymentStatus? status = null)
    {
        var pagedPayments = await _unitOfWork.Payments.GetPagedAsync(pagination, status);
        var dtos = pagedPayments.Items.Select(p => p.ToDto()).ToList();

        var result = PagedResult<PaymentDto>.Create(dtos, pagedPayments.TotalCount, pagedPayments.Page, pagedPayments.PageSize);
        return ServiceResult<PagedResult<PaymentDto>>.Success(result);
    }

    public async Task<ServiceResult<PaymentDto>> GetPaymentByIdAsync(int id)
    {
        var payment = await _unitOfWork.Payments.GetByIdWithDetailsAsync(id);
        if (payment == null)
            return ServiceResult<PaymentDto>.Failure("Payment not found");

        return ServiceResult<PaymentDto>.Success(payment.ToDto());
    }

    public async Task<ServiceResult<IEnumerable<PaymentDto>>> GetPaymentsByBookingIdAsync(int bookingId)
    {
        var payments = await _unitOfWork.Payments.GetByBookingIdAsync(bookingId);
        var dtos = payments.Select(p => p.ToDto());
        return ServiceResult<IEnumerable<PaymentDto>>.Success(dtos);
    }

    public async Task<ServiceResult<IEnumerable<PaymentDto>>> GetPaymentsByCustomerIdAsync(int customerId)
    {
        var payments = await _unitOfWork.Payments.GetByCustomerIdAsync(customerId);
        var dtos = payments.Select(p => p.ToDto());
        return ServiceResult<IEnumerable<PaymentDto>>.Success(dtos);
    }

    public async Task<ServiceResult<PaymentDto>> CreatePaymentAsync(CreatePaymentRequest request)
    {
        var booking = await _unitOfWork.Bookings.GetByIdWithDetailsAsync(request.BookingId);
        if (booking == null)
            return ServiceResult<PaymentDto>.Failure("Booking not found");

        var payment = new Payment
        {
            BookingId = request.BookingId,
            CustomerId = booking.CustomerId,
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Payments.AddAsync(payment);
        await _unitOfWork.SaveChangesAsync();

        var createdPayment = await _unitOfWork.Payments.GetByIdWithDetailsAsync(payment.Id);
        return ServiceResult<PaymentDto>.Success(createdPayment!.ToDto(), "Payment initiated");
    }

    public async Task<ServiceResult<PaymentDto>> ProcessPaymentAsync(int id, ProcessPaymentRequest request)
    {
        var payment = await _unitOfWork.Payments.GetByIdWithDetailsAsync(id);
        if (payment == null)
            return ServiceResult<PaymentDto>.Failure("Payment not found");

        if (payment.Status != PaymentStatus.Pending)
            return ServiceResult<PaymentDto>.Failure("Payment has already been processed");

        if (payment.Amount < payment.Booking!.EstimatedPrice * 0.8m)
            return ServiceResult<PaymentDto>.Failure("At least 80% of the booking amount is required before driver acceptance");

        payment.TransactionId = request.TransactionId;
        payment.PaymentGatewayResponse = request.PaymentGatewayResponse;
        payment.Status = PaymentStatus.Completed;
        payment.PaidAt = DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Payments.Update(payment);

        var booking = payment.Booking;
        if (booking != null && booking.Status == BookingStatus.Pending)
        {
            booking.Status = BookingStatus.Confirmed;
            booking.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Bookings.Update(booking);

            var existingDriverIds = await _db.RideRequests
                .Where(request => request.BookingId == booking.Id)
                .Select(request => request.DriverId)
                .ToListAsync();
            var availableDriverIds = await _db.Drivers
                .Where(driver => driver.IsActive && !existingDriverIds.Contains(driver.Id))
                .Select(driver => driver.Id)
                .ToListAsync();
            _db.RideRequests.AddRange(availableDriverIds.Select(driverId => new RideRequest
            {
                BookingId = booking.Id,
                DriverId = driverId
            }));
        }

        await _unitOfWork.SaveChangesAsync();

        // Send notification
        await _notificationService.CreateNotificationAsync(new DTOs.Notification.CreateNotificationRequest
        {
            CustomerId = payment.CustomerId,
            Type = NotificationType.PaymentReceived,
            Title = "Payment Received",
            Message = $"Payment of ₹{payment.Amount:F2} has been processed successfully.",
            BookingId = payment.BookingId
        });

        if (booking != null)
        {
            await _notificationService.CreateNotificationAsync(new DTOs.Notification.CreateNotificationRequest
            {
                CustomerId = booking.CustomerId,
                Type = NotificationType.BookingConfirmed,
                Title = "Booking Confirmed",
                Message = $"Your booking #{booking.Id} has been confirmed.",
                BookingId = booking.Id
            });
        }

        return ServiceResult<PaymentDto>.Success(payment.ToDto(), "Payment processed successfully");
    }

    public async Task<ServiceResult<PaymentDto>> RefundPaymentAsync(int id)
    {
        var payment = await _unitOfWork.Payments.GetByIdWithDetailsAsync(id);
        if (payment == null)
            return ServiceResult<PaymentDto>.Failure("Payment not found");

        if (payment.Status != PaymentStatus.Completed)
            return ServiceResult<PaymentDto>.Failure("Only completed payments can be refunded");

        payment.Status = PaymentStatus.Refunded;
        payment.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Payments.Update(payment);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<PaymentDto>.Success(payment.ToDto(), "Payment refunded successfully");
    }
}
