using backend.Repositories;
using backend.Services.Implementations;
using backend.Services.Interfaces;

namespace backend.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        // Register generic repository
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        
        // Register specific repositories
        services.AddScoped<IVehicleRepository, VehicleRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IDriverRepository, DriverRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IVehicleCategoryRepository, VehicleCategoryRepository>();
        services.AddScoped<ICouponRepository, CouponRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IRouteRepository, RouteRepository>();
        
        // Register Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        
        return services;
    }

    public static IServiceCollection AddBusinessServices(this IServiceCollection services)
    {
        // Register all business services
        services.AddScoped<IVehicleService, VehicleService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IDriverService, DriverService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IVehicleCategoryService, VehicleCategoryService>();
        services.AddScoped<ICouponService, CouponService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IAuthService, AuthService>();
        
        return services;
    }
}