namespace backend.Repositories;

public interface IUnitOfWork : IDisposable
{
    IVehicleRepository Vehicles { get; }
    ICustomerRepository Customers { get; }
    IDriverRepository Drivers { get; }
    IBookingRepository Bookings { get; }
    IPaymentRepository Payments { get; }
    IReviewRepository Reviews { get; }
    IVehicleCategoryRepository VehicleCategories { get; }
    ICouponRepository Coupons { get; }
    INotificationRepository Notifications { get; }
    IRouteRepository Routes { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
