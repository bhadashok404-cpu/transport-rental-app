using backend.Models;
using backend.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // DbSets
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<VehicleCategory> VehicleCategories => Set<VehicleCategory>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<backend.Models.Route> Routes => Set<backend.Models.Route>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureVehicleCategory(modelBuilder);
        ConfigureVehicle(modelBuilder);
        ConfigureCustomer(modelBuilder);
        ConfigureDriver(modelBuilder);
        ConfigureBooking(modelBuilder);
        ConfigurePayment(modelBuilder);
        ConfigureReview(modelBuilder);
        ConfigureCoupon(modelBuilder);
        ConfigureNotification(modelBuilder);
        ConfigureRoute(modelBuilder);
        
        SeedData(modelBuilder);
    }

    private static void ConfigureVehicleCategory(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<VehicleCategory>(entity =>
        {
            entity.HasKey(vc => vc.Id);
            
            entity.Property(vc => vc.Name)
                .IsRequired()
                .HasMaxLength(100);
                
            entity.Property(vc => vc.Description)
                .HasMaxLength(500);
                
            entity.Property(vc => vc.BasePrice)
                .HasPrecision(18, 2);
                
            entity.Property(vc => vc.PricePerKm)
                .HasPrecision(18, 2);
                
            entity.HasIndex(vc => vc.Name)
                .IsUnique();
                
            entity.HasIndex(vc => vc.DisplayOrder);
        });
    }

    private static void ConfigureVehicle(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(v => v.Id);
            
            entity.Property(v => v.RegistrationNumber)
                .IsRequired()
                .HasMaxLength(20);
                
            entity.Property(v => v.Make)
                .IsRequired()
                .HasMaxLength(100);
                
            entity.Property(v => v.Model)
                .IsRequired()
                .HasMaxLength(100);
                
            entity.Property(v => v.VehicleType)
                .HasConversion<string>();
                
            entity.Property(v => v.FuelType)
                .HasMaxLength(50);
                
            entity.Property(v => v.PricePerDay)
                .HasPrecision(18, 2);
                
            entity.Property(v => v.PricePerKm)
                .HasPrecision(18, 2);
                
            entity.HasIndex(v => v.RegistrationNumber)
                .IsUnique();
                
            entity.HasIndex(v => new { v.Make, v.Model });
            entity.HasIndex(v => v.VehicleType);
            entity.HasIndex(v => v.IsAvailable);
            
            // Relationships
            entity.HasOne(v => v.VehicleCategory)
                .WithMany(vc => vc.Vehicles)
                .HasForeignKey(v => v.VehicleCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(v => v.CurrentDriver)
                .WithMany(d => d.Vehicles)
                .HasForeignKey(v => v.CurrentDriverId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigureCustomer(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(c => c.Id);
            
            entity.Property(c => c.FirstName)
                .IsRequired()
                .HasMaxLength(100);
                
            entity.Property(c => c.LastName)
                .IsRequired()
                .HasMaxLength(100);
                
            entity.Property(c => c.Email)
                .IsRequired()
                .HasMaxLength(255);
                
            entity.Property(c => c.PhoneNumber)
                .IsRequired()
                .HasMaxLength(20);
                
            entity.Property(c => c.Address)
                .HasMaxLength(500);
                
            entity.HasIndex(c => c.Email)
                .IsUnique();
                
            entity.HasIndex(c => c.PhoneNumber);
            entity.HasIndex(c => new { c.FirstName, c.LastName });
        });
    }

    private static void ConfigureDriver(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Driver>(entity =>
        {
            entity.HasKey(d => d.Id);
            
            entity.Property(d => d.FirstName)
                .IsRequired()
                .HasMaxLength(100);
                
            entity.Property(d => d.LastName)
                .IsRequired()
                .HasMaxLength(100);
                
            entity.Property(d => d.Email)
                .IsRequired()
                .HasMaxLength(255);
                
            entity.Property(d => d.PhoneNumber)
                .IsRequired()
                .HasMaxLength(20);
                
            entity.Property(d => d.LicenseNumber)
                .IsRequired()
                .HasMaxLength(50);
                
            entity.Property(d => d.Address)
                .HasMaxLength(500);
                
            entity.Property(d => d.Status)
                .HasConversion<string>();
                
            entity.Property(d => d.Rating)
                .HasPrecision(3, 2);
                
            entity.HasIndex(d => d.Email)
                .IsUnique();
                
            entity.HasIndex(d => d.LicenseNumber)
                .IsUnique();
                
            entity.HasIndex(d => d.PhoneNumber);
            entity.HasIndex(d => d.Status);
            entity.HasIndex(d => d.Rating);
            entity.HasIndex(d => new { d.FirstName, d.LastName });
        });
    }
    private static void ConfigureBooking(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(b => b.Id);
            
            entity.Property(b => b.PickupLocation)
                .IsRequired()
                .HasMaxLength(500);
                
            entity.Property(b => b.DropLocation)
                .IsRequired()
                .HasMaxLength(500);
                
            entity.Property(b => b.EstimatedPrice)
                .HasPrecision(18, 2);
                
            entity.Property(b => b.ActualPrice)
                .HasPrecision(18, 2);
                
            entity.Property(b => b.DiscountAmount)
                .HasPrecision(18, 2);
                
            entity.Property(b => b.DistanceInKm)
                .HasPrecision(10, 2);
                
            entity.Property(b => b.Status)
                .HasConversion<string>();
                
            entity.Property(b => b.CancellationReason)
                .HasMaxLength(1000);
                
            entity.Property(b => b.SpecialInstructions)
                .HasMaxLength(1000);
                
            entity.HasIndex(b => b.Status);
            entity.HasIndex(b => b.PickupDate);
            entity.HasIndex(b => b.CreatedAt);
            entity.HasIndex(b => new { b.CustomerId, b.Status });
            entity.HasIndex(b => new { b.DriverId, b.Status });
            
            // Relationships
            entity.HasOne(b => b.Customer)
                .WithMany(c => c.Bookings)
                .HasForeignKey(b => b.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(b => b.Vehicle)
                .WithMany(v => v.Bookings)
                .HasForeignKey(b => b.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(b => b.Driver)
                .WithMany(d => d.Bookings)
                .HasForeignKey(b => b.DriverId)
                .OnDelete(DeleteBehavior.SetNull);
                
            entity.HasOne(b => b.Coupon)
                .WithMany(c => c.Bookings)
                .HasForeignKey(b => b.CouponId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigurePayment(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(p => p.Id);
            
            entity.Property(p => p.Amount)
                .HasPrecision(18, 2);
                
            entity.Property(p => p.PaymentMethod)
                .HasConversion<string>();
                
            entity.Property(p => p.Status)
                .HasConversion<string>();
                
            entity.Property(p => p.TransactionId)
                .HasMaxLength(100);
                
            entity.HasIndex(p => p.TransactionId)
                .IsUnique();
                
            entity.HasIndex(p => p.Status);
            entity.HasIndex(p => p.CreatedAt);
            entity.HasIndex(p => new { p.CustomerId, p.Status });
            
            // Relationships
            entity.HasOne(p => p.Customer)
                .WithMany(c => c.Payments)
                .HasForeignKey(p => p.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(p => p.Booking)
                .WithMany(b => b.Payments)
                .HasForeignKey(p => p.BookingId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigureReview(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(r => r.Id);
            
            entity.Property(r => r.Rating)
                .IsRequired();
                
            entity.Property(r => r.Comment)
                .HasMaxLength(1000);
                
            entity.HasIndex(r => r.Rating);
            entity.HasIndex(r => r.CreatedAt);
            entity.HasIndex(r => new { r.DriverId, r.IsDriverReview });
            entity.HasIndex(r => new { r.VehicleId, r.IsVehicleReview });
            
            // Relationships
            entity.HasOne(r => r.Customer)
                .WithMany(c => c.Reviews)
                .HasForeignKey(r => r.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(r => r.Booking)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BookingId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(r => r.Driver)
                .WithMany(d => d.Reviews)
                .HasForeignKey(r => r.DriverId)
                .OnDelete(DeleteBehavior.SetNull);
                
            entity.HasOne(r => r.Vehicle)
                .WithMany(v => v.Reviews)
                .HasForeignKey(r => r.VehicleId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigureCoupon(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Coupon>(entity =>
        {
            entity.HasKey(c => c.Id);
            
            entity.Property(c => c.Code)
                .IsRequired()
                .HasMaxLength(50);
                
            entity.Property(c => c.Description)
                .IsRequired()
                .HasMaxLength(500);
                
            entity.Property(c => c.DiscountPercentage)
                .HasPrecision(5, 2);
                
            entity.Property(c => c.MaxDiscountAmount)
                .HasPrecision(18, 2);
                
            entity.Property(c => c.MinOrderAmount)
                .HasPrecision(18, 2);
                
            entity.HasIndex(c => c.Code)
                .IsUnique();
                
            entity.HasIndex(c => c.ValidFrom);
            entity.HasIndex(c => c.ValidUntil);
            entity.HasIndex(c => new { c.IsActive, c.ValidFrom, c.ValidUntil });
        });
    }

    private static void ConfigureNotification(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(n => n.Id);
            
            entity.Property(n => n.Type)
                .HasConversion<string>();
                
            entity.Property(n => n.Title)
                .IsRequired()
                .HasMaxLength(200);
                
            entity.Property(n => n.Message)
                .IsRequired()
                .HasMaxLength(1000);
                
            entity.HasIndex(n => new { n.CustomerId, n.IsRead });
            entity.HasIndex(n => n.CreatedAt);
            entity.HasIndex(n => n.Type);
            
            // Relationships
            entity.HasOne(n => n.Customer)
                .WithMany(c => c.Notifications)
                .HasForeignKey(n => n.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureRoute(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<backend.Models.Route>(entity =>
        {
            entity.HasKey(r => r.Id);
            
            entity.Property(r => r.StartLocation)
                .IsRequired()
                .HasMaxLength(500);
                
            entity.Property(r => r.EndLocation)
                .IsRequired()
                .HasMaxLength(500);
                
            entity.Property(r => r.StartLatitude)
                .HasPrecision(10, 8);
                
            entity.Property(r => r.StartLongitude)
                .HasPrecision(11, 8);
                
            entity.Property(r => r.EndLatitude)
                .HasPrecision(10, 8);
                
            entity.Property(r => r.EndLongitude)
                .HasPrecision(11, 8);
                
            entity.Property(r => r.DistanceInKm)
                .HasPrecision(10, 2);
                
            entity.HasIndex(r => r.BookingId)
                .IsUnique();
                
            // Relationships
            entity.HasOne(r => r.Booking)
                .WithOne(b => b.Route)
                .HasForeignKey<backend.Models.Route>(r => r.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        
        // Seed Vehicle Categories
        modelBuilder.Entity<VehicleCategory>().HasData(
            new VehicleCategory { Id = 1, Name = "Economy", Description = "Budget-friendly vehicles", IconUrl = "/icons/economy.svg", BasePrice = 150, PricePerKm = 8, DisplayOrder = 1, IsActive = true, CreatedAt = seedDate },
            new VehicleCategory { Id = 2, Name = "Premium", Description = "Comfortable premium vehicles", IconUrl = "/icons/premium.svg", BasePrice = 300, PricePerKm = 12, DisplayOrder = 2, IsActive = true, CreatedAt = seedDate },
            new VehicleCategory { Id = 3, Name = "Luxury", Description = "High-end luxury vehicles", IconUrl = "/icons/luxury.svg", BasePrice = 500, PricePerKm = 20, DisplayOrder = 3, IsActive = true, CreatedAt = seedDate },
            new VehicleCategory { Id = 4, Name = "SUV", Description = "Spacious SUVs for group travel", IconUrl = "/icons/suv.svg", BasePrice = 400, PricePerKm = 15, DisplayOrder = 4, IsActive = true, CreatedAt = seedDate },
            new VehicleCategory { Id = 5, Name = "Commercial", Description = "Commercial vehicles for goods transport", IconUrl = "/icons/commercial.svg", BasePrice = 600, PricePerKm = 25, DisplayOrder = 5, IsActive = true, CreatedAt = seedDate }
        );

        // Seed Sample Vehicles
        modelBuilder.Entity<Vehicle>().HasData(
            new Vehicle { Id = 1, RegistrationNumber = "MH12AB1234", Make = "Maruti Suzuki", Model = "Swift", Year = 2022, VehicleType = VehicleType.MiniCab, VehicleCategoryId = 1, PricePerDay = 150, PricePerKm = 8, SeatingCapacity = 4, FuelType = "Petrol", ImageUrl = "/images/swift.jpg", IsAvailable = true, IsActive = true, CreatedAt = seedDate },
            new Vehicle { Id = 2, RegistrationNumber = "KA01CD5678", Make = "Honda", Model = "City", Year = 2023, VehicleType = VehicleType.Sedan, VehicleCategoryId = 2, PricePerDay = 300, PricePerKm = 12, SeatingCapacity = 5, FuelType = "Petrol", ImageUrl = "/images/city.jpg", IsAvailable = true, IsActive = true, CreatedAt = seedDate },
            new Vehicle { Id = 3, RegistrationNumber = "DL08EF9012", Make = "BMW", Model = "X1", Year = 2023, VehicleType = VehicleType.SUV, VehicleCategoryId = 3, PricePerDay = 500, PricePerKm = 20, SeatingCapacity = 5, FuelType = "Diesel", ImageUrl = "/images/bmw-x1.jpg", IsAvailable = true, IsActive = true, CreatedAt = seedDate },
            new Vehicle { Id = 4, RegistrationNumber = "TN09GH3456", Make = "Mahindra", Model = "Scorpio", Year = 2022, VehicleType = VehicleType.SUV, VehicleCategoryId = 4, PricePerDay = 400, PricePerKm = 15, SeatingCapacity = 7, FuelType = "Diesel", ImageUrl = "/images/scorpio.jpg", IsAvailable = true, IsActive = true, CreatedAt = seedDate },
            new Vehicle { Id = 5, RegistrationNumber = "GJ05IJ7890", Make = "Tata", Model = "Ace", Year = 2021, VehicleType = VehicleType.Truck, VehicleCategoryId = 5, PricePerDay = 600, PricePerKm = 25, SeatingCapacity = 3, FuelType = "Diesel", ImageUrl = "/images/tata-ace.jpg", IsAvailable = true, IsActive = true, CreatedAt = seedDate }
        );

        // Seed Sample Customers
        modelBuilder.Entity<Customer>().HasData(
            new Customer { Id = 1, FirstName = "Rahul", LastName = "Sharma", Email = "rahul.sharma@example.com", PhoneNumber = "+919876543210", Address = "123 MG Road, Bangalore", IsVerified = true, IsActive = true, CreatedAt = seedDate },
            new Customer { Id = 2, FirstName = "Priya", LastName = "Patel", Email = "priya.patel@example.com", PhoneNumber = "+919876543211", Address = "456 FC Road, Pune", IsVerified = true, IsActive = true, CreatedAt = seedDate },
            new Customer { Id = 3, FirstName = "Amit", LastName = "Kumar", Email = "amit.kumar@example.com", PhoneNumber = "+919876543212", Address = "789 CP, Delhi", IsVerified = false, IsActive = true, CreatedAt = seedDate }
        );

        // Seed Sample Drivers
        modelBuilder.Entity<Driver>().HasData(
            new Driver { Id = 1, FirstName = "Suresh", LastName = "Singh", Email = "suresh.singh@example.com", PhoneNumber = "+919876543220", LicenseNumber = "DL123456789", LicenseExpiryDate = new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), Address = "Driver Colony, Bangalore", Rating = 4.5m, TotalTrips = 150, Status = DriverStatus.Available, IsVerified = true, IsActive = true, CreatedAt = seedDate },
            new Driver { Id = 2, FirstName = "Ramesh", LastName = "Yadav", Email = "ramesh.yadav@example.com", PhoneNumber = "+919876543221", LicenseNumber = "DL987654321", LicenseExpiryDate = new DateTime(2027, 12, 31, 0, 0, 0, DateTimeKind.Utc), Address = "Transport Nagar, Pune", Rating = 4.2m, TotalTrips = 98, Status = DriverStatus.Available, IsVerified = true, IsActive = true, CreatedAt = seedDate },
            new Driver { Id = 3, FirstName = "Vijay", LastName = "Gupta", Email = "vijay.gupta@example.com", PhoneNumber = "+919876543222", LicenseNumber = "DL456789123", LicenseExpiryDate = new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc), Address = "Lajpat Nagar, Delhi", Rating = 4.8m, TotalTrips = 220, Status = DriverStatus.Available, IsVerified = true, IsActive = true, CreatedAt = seedDate }
        );

        // Seed Sample Coupons
        modelBuilder.Entity<Coupon>().HasData(
            new Coupon { Id = 1, Code = "WELCOME10", Description = "Welcome offer - 10% off", DiscountPercentage = 10, MaxDiscountAmount = 100, MinOrderAmount = 200, ValidFrom = seedDate, ValidUntil = new DateTime(2024, 12, 31, 0, 0, 0, DateTimeKind.Utc), MaxUsageCount = 1000, CurrentUsageCount = 0, IsActive = true, CreatedAt = seedDate },
            new Coupon { Id = 2, Code = "FIRSTRIDE", Description = "First ride free up to ₹150", DiscountPercentage = 100, MaxDiscountAmount = 150, MinOrderAmount = 100, ValidFrom = seedDate, ValidUntil = new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc), MaxUsageCount = 500, CurrentUsageCount = 0, IsActive = true, CreatedAt = seedDate },
            new Coupon { Id = 3, Code = "WEEKEND20", Description = "Weekend special - 20% off", DiscountPercentage = 20, MaxDiscountAmount = 200, MinOrderAmount = 300, ValidFrom = seedDate, ValidUntil = new DateTime(2024, 6, 30, 0, 0, 0, DateTimeKind.Utc), MaxUsageCount = 200, CurrentUsageCount = 0, IsActive = true, CreatedAt = seedDate }
        );
    }
}