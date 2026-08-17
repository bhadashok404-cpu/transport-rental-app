using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Coupons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    MaxDiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MinOrderAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ValidFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ValidUntil = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MaxUsageCount = table.Column<int>(type: "int", nullable: false),
                    CurrentUsageCount = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ProfileImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Drivers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LicenseNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LicenseExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ProfileImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rating = table.Column<decimal>(type: "decimal(3,2)", precision: 3, scale: 2, nullable: false),
                    TotalTrips = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastActiveAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drivers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VehicleCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IconUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PricePerKm = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    BookingId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RegistrationNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Make = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Model = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    VehicleType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    VehicleCategoryId = table.Column<int>(type: "int", nullable: false),
                    PricePerDay = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PricePerKm = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SeatingCapacity = table.Column<int>(type: "int", nullable: false),
                    FuelType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CurrentDriverId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Vehicles_Drivers_CurrentDriverId",
                        column: x => x.CurrentDriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Vehicles_VehicleCategories_VehicleCategoryId",
                        column: x => x.VehicleCategoryId,
                        principalTable: "VehicleCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    DriverId = table.Column<int>(type: "int", nullable: true),
                    PickupLocation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DropLocation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PickupDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReturnDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualPickupTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualDropTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstimatedPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CouponId = table.Column<int>(type: "int", nullable: true),
                    DistanceInKm = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CancellationReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SpecialInstructions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_Coupons_CouponId",
                        column: x => x.CouponId,
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Bookings_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Bookings_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TransactionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentGatewayResponse = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    DriverId = table.Column<int>(type: "int", nullable: true),
                    VehicleId = table.Column<int>(type: "int", nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsDriverReview = table.Column<bool>(type: "bit", nullable: false),
                    IsVehicleReview = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Reviews_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Routes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    StartLocation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EndLocation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    StartLatitude = table.Column<decimal>(type: "decimal(10,8)", precision: 10, scale: 8, nullable: true),
                    StartLongitude = table.Column<decimal>(type: "decimal(11,8)", precision: 11, scale: 8, nullable: true),
                    EndLatitude = table.Column<decimal>(type: "decimal(10,8)", precision: 10, scale: 8, nullable: true),
                    EndLongitude = table.Column<decimal>(type: "decimal(11,8)", precision: 11, scale: 8, nullable: true),
                    DistanceInKm = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    EstimatedDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    ActualDurationMinutes = table.Column<int>(type: "int", nullable: true),
                    RoutePolyline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Routes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Routes_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Coupons",
                columns: new[] { "Id", "Code", "CreatedAt", "CurrentUsageCount", "Description", "DiscountPercentage", "IsActive", "MaxDiscountAmount", "MaxUsageCount", "MinOrderAmount", "ValidFrom", "ValidUntil" },
                values: new object[,]
                {
                    { 1, "WELCOME10", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Welcome offer - 10% off", 10m, true, 100m, 1000, 200m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "FIRSTRIDE", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "First ride free up to ₹150", 100m, true, 150m, 500, 100m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "WEEKEND20", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "Weekend special - 20% off", 20m, true, 200m, 200, 300m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "Customers",
                columns: new[] { "Id", "Address", "CreatedAt", "Email", "FirstName", "IsActive", "IsVerified", "LastName", "PhoneNumber", "ProfileImageUrl", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "123 MG Road, Bangalore", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "rahul.sharma@example.com", "Rahul", true, true, "Sharma", "+919876543210", null, null },
                    { 2, "456 FC Road, Pune", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "priya.patel@example.com", "Priya", true, true, "Patel", "+919876543211", null, null },
                    { 3, "789 CP, Delhi", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "amit.kumar@example.com", "Amit", true, false, "Kumar", "+919876543212", null, null }
                });

            migrationBuilder.InsertData(
                table: "Drivers",
                columns: new[] { "Id", "Address", "CreatedAt", "Email", "FirstName", "IsActive", "IsVerified", "LastActiveAt", "LastName", "LicenseExpiryDate", "LicenseNumber", "PhoneNumber", "ProfileImageUrl", "Rating", "Status", "TotalTrips", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Driver Colony, Bangalore", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "suresh.singh@example.com", "Suresh", true, true, null, "Singh", new DateTime(2026, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), "DL123456789", "+919876543220", null, 4.5m, "Available", 150, null },
                    { 2, "Transport Nagar, Pune", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "ramesh.yadav@example.com", "Ramesh", true, true, null, "Yadav", new DateTime(2027, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), "DL987654321", "+919876543221", null, 4.2m, "Available", 98, null },
                    { 3, "Lajpat Nagar, Delhi", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "vijay.gupta@example.com", "Vijay", true, true, null, "Gupta", new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), "DL456789123", "+919876543222", null, 4.8m, "Available", 220, null }
                });

            migrationBuilder.InsertData(
                table: "VehicleCategories",
                columns: new[] { "Id", "BasePrice", "CreatedAt", "Description", "DisplayOrder", "IconUrl", "IsActive", "Name", "PricePerKm", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 150m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Budget-friendly vehicles", 1, "/icons/economy.svg", true, "Economy", 8m, null },
                    { 2, 300m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Comfortable premium vehicles", 2, "/icons/premium.svg", true, "Premium", 12m, null },
                    { 3, 500m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "High-end luxury vehicles", 3, "/icons/luxury.svg", true, "Luxury", 20m, null },
                    { 4, 400m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Spacious SUVs for group travel", 4, "/icons/suv.svg", true, "SUV", 15m, null },
                    { 5, 600m, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Commercial vehicles for goods transport", 5, "/icons/commercial.svg", true, "Commercial", 25m, null }
                });

            migrationBuilder.InsertData(
                table: "Vehicles",
                columns: new[] { "Id", "CreatedAt", "CurrentDriverId", "FuelType", "ImageUrl", "IsActive", "IsAvailable", "Make", "Model", "PricePerDay", "PricePerKm", "RegistrationNumber", "SeatingCapacity", "UpdatedAt", "VehicleCategoryId", "VehicleType", "Year" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Petrol", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/2018_Suzuki_Swift_%28AZ%2C_facelift%29_1.2_GL_sedan_%282019-03-13%29_01.jpg/320px-2018_Suzuki_Swift_%28AZ%2C_facelift%29_1.2_GL_sedan_%282019-03-13%29_01.jpg", true, true, "Maruti Suzuki", "Swift", 150m, 8m, "MH12AB1234", 4, null, 1, "MiniCab", 2022 },
                    { 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Petrol", "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2020_Hyundai_i20_%28BC3%29_Elite_sedan_%282021-07-25%29_01.jpg/320px-2020_Hyundai_i20_%28BC3%29_Elite_sedan_%282021-07-25%29_01.jpg", true, true, "Hyundai", "i20", 160m, 8m, "DL09CD2345", 5, null, 1, "MiniCab", 2023 },
                    { 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Petrol", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Tata_Tiago_facelift_%28front%29.jpg/320px-Tata_Tiago_facelift_%28front%29.jpg", true, true, "Tata", "Tiago", 140m, 7m, "KA05EF3456", 5, null, 1, "MiniCab", 2023 },
                    { 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Petrol", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/2021_Honda_City_RS_e%3AHEV_%28GM6%29_%28front%29.jpg/320px-2021_Honda_City_RS_e%3AHEV_%28GM6%29_%28front%29.jpg", true, true, "Honda", "City", 300m, 12m, "KA01CD5678", 5, null, 2, "Sedan", 2023 },
                    { 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Petrol", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/2023_Hyundai_Verna_%28SX%2C_India%29_front_8.14.23.jpg/320px-2023_Hyundai_Verna_%28SX%2C_India%29_front_8.14.23.jpg", true, true, "Hyundai", "Verna", 280m, 11m, "MH14GH7890", 5, null, 2, "Sedan", 2023 },
                    { 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Petrol", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Tata_Nexon_EV_Max_%28facelift%2C_front%29%2C_Kolkata_2023.jpg/320px-Tata_Nexon_EV_Max_%28facelift%2C_front%29%2C_Kolkata_2023.jpg", true, true, "Tata", "Nexon", 320m, 13m, "TN07IJ8901", 5, null, 2, "SUV", 2023 },
                    { 7, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Diesel", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2023_BMW_X1_xDrive23i_%28U11%29%2C_front_8.13.23.jpg/320px-2023_BMW_X1_xDrive23i_%28U11%29%2C_front_8.13.23.jpg", true, true, "BMW", "X1", 500m, 20m, "DL08EF9012", 5, null, 3, "SUV", 2023 },
                    { 8, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Petrol", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Mercedes-Benz_W206_IMG_6639.jpg/320px-Mercedes-Benz_W206_IMG_6639.jpg", true, true, "Mercedes-Benz", "C-Class", 600m, 22m, "MH01KL1234", 5, null, 3, "Sedan", 2023 },
                    { 9, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Diesel", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Audi_Q3_F3_IMG_4571.jpg/320px-Audi_Q3_F3_IMG_4571.jpg", true, true, "Audi", "Q3", 550m, 21m, "KA03MN2345", 5, null, 3, "SUV", 2022 },
                    { 10, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Diesel", "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Mahindra_Scorpio-N_front.jpg/320px-Mahindra_Scorpio-N_front.jpg", true, true, "Mahindra", "Scorpio N", 400m, 15m, "TN09GH3456", 7, null, 4, "SUV", 2023 },
                    { 11, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Diesel", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2022_Toyota_Innova_Crysta_%28AN140%2C_facelift%29_GX_MPV_%282022-09-17%29_01.jpg/320px-2022_Toyota_Innova_Crysta_%28AN140%2C_facelift%29_GX_MPV_%282022-09-17%29_01.jpg", true, true, "Toyota", "Innova Crysta", 420m, 16m, "GJ06PQ4567", 7, null, 4, "Van", 2022 },
                    { 12, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Diesel", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/2022_Kia_Carens_1.5_Diesel_Luxury_Plus_%28front%29.jpg/320px-2022_Kia_Carens_1.5_Diesel_Luxury_Plus_%28front%29.jpg", true, true, "Kia", "Carens", 380m, 14m, "RJ14RS5678", 6, null, 4, "Van", 2023 },
                    { 13, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Diesel", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Tata_Ace_Gold_%28front%29.jpg/320px-Tata_Ace_Gold_%28front%29.jpg", true, true, "Tata", "Ace", 600m, 25m, "GJ05IJ7890", 3, null, 5, "Truck", 2021 },
                    { 14, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Diesel", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Mahindra_Bolero_Pik-Up_Extra-Long_flatbed_%28front%29.jpg/320px-Mahindra_Bolero_Pik-Up_Extra-Long_flatbed_%28front%29.jpg", true, true, "Mahindra", "Bolero Pickup", 650m, 26m, "MH04TU6789", 3, null, 5, "Truck", 2022 },
                    { 15, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Diesel", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Ashok_Leyland_Dost%2B_CNG_%28front%29.jpg/320px-Ashok_Leyland_Dost%2B_CNG_%28front%29.jpg", true, true, "Ashok Leyland", "Dost", 700m, 28m, "KA02VW7890", 3, null, 5, "Truck", 2021 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_CouponId",
                table: "Bookings",
                column: "CouponId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_CreatedAt",
                table: "Bookings",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_CustomerId_Status",
                table: "Bookings",
                columns: new[] { "CustomerId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_DriverId_Status",
                table: "Bookings",
                columns: new[] { "DriverId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_PickupDate",
                table: "Bookings",
                column: "PickupDate");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_Status",
                table: "Bookings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_VehicleId",
                table: "Bookings",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_Code",
                table: "Coupons",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_IsActive_ValidFrom_ValidUntil",
                table: "Coupons",
                columns: new[] { "IsActive", "ValidFrom", "ValidUntil" });

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_ValidFrom",
                table: "Coupons",
                column: "ValidFrom");

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_ValidUntil",
                table: "Coupons",
                column: "ValidUntil");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Email",
                table: "Customers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_FirstName_LastName",
                table: "Customers",
                columns: new[] { "FirstName", "LastName" });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_PhoneNumber",
                table: "Customers",
                column: "PhoneNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_Email",
                table: "Drivers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_FirstName_LastName",
                table: "Drivers",
                columns: new[] { "FirstName", "LastName" });

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_LicenseNumber",
                table: "Drivers",
                column: "LicenseNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_PhoneNumber",
                table: "Drivers",
                column: "PhoneNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_Rating",
                table: "Drivers",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_Status",
                table: "Drivers",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedAt",
                table: "Notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CustomerId_IsRead",
                table: "Notifications",
                columns: new[] { "CustomerId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_Type",
                table: "Notifications",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_BookingId",
                table: "Payments",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CreatedAt",
                table: "Payments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CustomerId_Status",
                table: "Payments",
                columns: new[] { "CustomerId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_Status",
                table: "Payments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TransactionId",
                table: "Payments",
                column: "TransactionId",
                unique: true,
                filter: "[TransactionId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_BookingId",
                table: "Reviews",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CreatedAt",
                table: "Reviews",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CustomerId",
                table: "Reviews",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_DriverId_IsDriverReview",
                table: "Reviews",
                columns: new[] { "DriverId", "IsDriverReview" });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_Rating",
                table: "Reviews",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_VehicleId_IsVehicleReview",
                table: "Reviews",
                columns: new[] { "VehicleId", "IsVehicleReview" });

            migrationBuilder.CreateIndex(
                name: "IX_Routes_BookingId",
                table: "Routes",
                column: "BookingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VehicleCategories_DisplayOrder",
                table: "VehicleCategories",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleCategories_Name",
                table: "VehicleCategories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_CurrentDriverId",
                table: "Vehicles",
                column: "CurrentDriverId");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_IsAvailable",
                table: "Vehicles",
                column: "IsAvailable");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_Make_Model",
                table: "Vehicles",
                columns: new[] { "Make", "Model" });

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_RegistrationNumber",
                table: "Vehicles",
                column: "RegistrationNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_VehicleCategoryId",
                table: "Vehicles",
                column: "VehicleCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_VehicleType",
                table: "Vehicles",
                column: "VehicleType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "Routes");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "Coupons");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "Vehicles");

            migrationBuilder.DropTable(
                name: "Drivers");

            migrationBuilder.DropTable(
                name: "VehicleCategories");
        }
    }
}
