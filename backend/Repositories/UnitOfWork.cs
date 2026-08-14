using backend.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace backend.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IDbContextTransaction? _transaction;

    public IVehicleRepository Vehicles { get; }
    public ICustomerRepository Customers { get; }
    public IDriverRepository Drivers { get; }
    public IBookingRepository Bookings { get; }
    public IPaymentRepository Payments { get; }
    public IReviewRepository Reviews { get; }
    public IVehicleCategoryRepository VehicleCategories { get; }
    public ICouponRepository Coupons { get; }
    public INotificationRepository Notifications { get; }
    public IRouteRepository Routes { get; }

    public UnitOfWork(
        AppDbContext context,
        IVehicleRepository vehicles,
        ICustomerRepository customers,
        IDriverRepository drivers,
        IBookingRepository bookings,
        IPaymentRepository payments,
        IReviewRepository reviews,
        IVehicleCategoryRepository vehicleCategories,
        ICouponRepository coupons,
        INotificationRepository notifications,
        IRouteRepository routes)
    {
        _context = context;
        Vehicles = vehicles;
        Customers = customers;
        Drivers = drivers;
        Bookings = bookings;
        Payments = payments;
        Reviews = reviews;
        VehicleCategories = vehicleCategories;
        Coupons = coupons;
        Notifications = notifications;
        Routes = routes;
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
