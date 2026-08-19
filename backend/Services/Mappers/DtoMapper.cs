using backend.DTOs.Booking;
using backend.DTOs.Coupon;
using backend.DTOs.Customer;
using backend.DTOs.Driver;
using backend.DTOs.Notification;
using backend.DTOs.Payment;
using backend.DTOs.Review;
using backend.DTOs.Vehicle;
using backend.DTOs.VehicleCategory;
using backend.Enums;
using backend.Models;

namespace backend.Services.Mappers;

public static class DtoMapper
{
    // Vehicle Mapping
    public static VehicleDto ToDto(this Vehicle vehicle)
    {
        return new VehicleDto
        {
            Id = vehicle.Id,
            Make = vehicle.Make,
            Model = vehicle.Model,
            Year = vehicle.Year,
            VehicleType = vehicle.VehicleType,
            VehicleCategoryId = vehicle.VehicleCategoryId,
            VehicleCategoryName = vehicle.VehicleCategory?.Name ?? string.Empty,
            PricePerDay = vehicle.PricePerDay,
            PricePerKm = vehicle.PricePerKm,
            SeatingCapacity = vehicle.SeatingCapacity,
            FuelType = vehicle.FuelType,
            IsAvailable = vehicle.IsAvailable,
            IsActive = vehicle.IsActive,
            CurrentDriverId = vehicle.CurrentDriverId,
            CurrentDriverName = vehicle.CurrentDriver != null ? $"{vehicle.CurrentDriver.FirstName} {vehicle.CurrentDriver.LastName}" : null,
            CreatedAt = vehicle.CreatedAt
        };
    }

    // Customer Mapping
    public static CustomerDto ToDto(this Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            FirstName = customer.FirstName,
            LastName = customer.LastName,
            Email = customer.Email,
            PhoneNumber = customer.PhoneNumber,
            Address = customer.Address,
            ProfileImageUrl = customer.ProfileImageUrl,
            IsVerified = customer.IsVerified,
            IsActive = customer.IsActive,
            CreatedAt = customer.CreatedAt
        };
    }

    // Driver Mapping
    public static DriverDto ToDto(this Driver driver)
    {
        return new DriverDto
        {
            Id = driver.Id,
            FirstName = driver.FirstName,
            LastName = driver.LastName,
            Email = driver.Email,
            PhoneNumber = driver.PhoneNumber,
            LicenseNumber = driver.LicenseNumber,
            LicenseExpiryDate = driver.LicenseExpiryDate,
            Address = driver.Address,
            ProfileImageUrl = driver.ProfileImageUrl,
            Rating = driver.Rating,
            TotalTrips = driver.TotalTrips,
            Status = driver.Status,
            IsVerified = driver.IsVerified,
            IsActive = driver.IsActive,
            LastActiveAt = driver.LastActiveAt,
            CreatedAt = driver.CreatedAt
        };
    }

    // Booking Mapping
    public static BookingDto ToDto(this Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            CustomerId = booking.CustomerId,
            CustomerName = booking.Customer != null ? $"{booking.Customer.FirstName} {booking.Customer.LastName}" : string.Empty,
            CustomerEmail = booking.Customer?.Email ?? string.Empty,
            CustomerPhone = booking.Customer?.PhoneNumber ?? string.Empty,
            VehicleId = booking.VehicleId,
            VehicleInfo = booking.Vehicle != null ? $"{booking.Vehicle.Make} {booking.Vehicle.Model}" : string.Empty,
            VehicleType = booking.Vehicle?.VehicleType ?? VehicleType.MiniCab,
            VehicleRegistration = booking.Status is BookingStatus.Confirmed or BookingStatus.DriverAssigned or BookingStatus.InProgress or BookingStatus.Completed
                ? booking.Vehicle?.RegistrationNumber ?? string.Empty
                : string.Empty,
            DriverId = booking.DriverId,
            DriverName = booking.Driver != null ? $"{booking.Driver.FirstName} {booking.Driver.LastName}" : null,
            DriverPhone = booking.Driver?.PhoneNumber,
            PickupLocation = booking.PickupLocation,
            DropLocation = booking.DropLocation,
            PickupDate = booking.PickupDate,
            ReturnDate = booking.ReturnDate,
            ActualPickupTime = booking.ActualPickupTime,
            ActualDropTime = booking.ActualDropTime,
            EstimatedPrice = booking.EstimatedPrice,
            PaymentStatus = booking.Payments.OrderByDescending(payment => payment.CreatedAt).Select(payment => payment.Status).FirstOrDefault(),
            ActualPrice = booking.ActualPrice,
            DiscountAmount = booking.DiscountAmount,
            CouponCode = booking.Coupon?.Code,
            DistanceInKm = booking.DistanceInKm,
            Status = booking.Status,
            CancellationReason = booking.CancellationReason,
            CancelledAt = booking.CancelledAt,
            SpecialInstructions = booking.SpecialInstructions,
            CreatedAt = booking.CreatedAt
        };
    }

    // Payment Mapping
    public static PaymentDto ToDto(this Payment payment)
    {
        return new PaymentDto
        {
            Id = payment.Id,
            BookingId = payment.BookingId,
            CustomerId = payment.CustomerId,
            CustomerName = payment.Customer != null ? $"{payment.Customer.FirstName} {payment.Customer.LastName}" : string.Empty,
            Amount = payment.Amount,
            PaymentMethod = payment.PaymentMethod,
            Status = payment.Status,
            TransactionId = payment.TransactionId,
            PaidAt = payment.PaidAt,
            CreatedAt = payment.CreatedAt
        };
    }

    // Review Mapping
    public static ReviewDto ToDto(this Review review)
    {
        return new ReviewDto
        {
            Id = review.Id,
            BookingId = review.BookingId,
            CustomerId = review.CustomerId,
            CustomerName = review.Customer != null ? $"{review.Customer.FirstName} {review.Customer.LastName}" : string.Empty,
            DriverId = review.DriverId,
            DriverName = review.Driver != null ? $"{review.Driver.FirstName} {review.Driver.LastName}" : null,
            VehicleId = review.VehicleId,
            VehicleInfo = review.Vehicle != null ? $"{review.Vehicle.Make} {review.Vehicle.Model}" : null,
            Rating = review.Rating,
            Comment = review.Comment,
            IsDriverReview = review.IsDriverReview,
            IsVehicleReview = review.IsVehicleReview,
            CreatedAt = review.CreatedAt
        };
    }

    // VehicleCategory Mapping
    public static VehicleCategoryDto ToDto(this VehicleCategory category)
    {
        return new VehicleCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IconUrl = category.IconUrl,
            BasePrice = category.BasePrice,
            PricePerKm = category.PricePerKm,
            IsActive = category.IsActive,
            DisplayOrder = category.DisplayOrder,
            VehicleCount = category.Vehicles?.Count ?? 0,
            CreatedAt = category.CreatedAt
        };
    }

    // Coupon Mapping
    public static CouponDto ToDto(this Coupon coupon)
    {
        return new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            Description = coupon.Description,
            DiscountPercentage = coupon.DiscountPercentage,
            MaxDiscountAmount = coupon.MaxDiscountAmount,
            MinOrderAmount = coupon.MinOrderAmount,
            ValidFrom = coupon.ValidFrom,
            ValidUntil = coupon.ValidUntil,
            MaxUsageCount = coupon.MaxUsageCount,
            CurrentUsageCount = coupon.CurrentUsageCount,
            IsActive = coupon.IsActive,
            CreatedAt = coupon.CreatedAt
        };
    }

    // Notification Mapping
    public static NotificationDto ToDto(this Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            CustomerId = notification.CustomerId,
            Type = notification.Type,
            Title = notification.Title,
            Message = notification.Message,
            IsRead = notification.IsRead,
            BookingId = notification.BookingId,
            CreatedAt = notification.CreatedAt
        };
    }
}
