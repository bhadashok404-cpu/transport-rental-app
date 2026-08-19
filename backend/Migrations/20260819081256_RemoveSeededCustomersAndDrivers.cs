using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSeededCustomersAndDrivers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DECLARE @CustomerIds TABLE (Id int);
                DECLARE @DriverIds TABLE (Id int);
                DECLARE @BookingIds TABLE (Id int);

                INSERT INTO @CustomerIds
                SELECT Id FROM Customers
                WHERE Email IN ('rahul.sharma@example.com', 'priya.patel@example.com', 'amit.kumar@example.com');

                INSERT INTO @DriverIds
                SELECT Id FROM Drivers
                WHERE Email IN ('suresh.singh@example.com', 'ramesh.yadav@example.com', 'vijay.gupta@example.com');

                INSERT INTO @BookingIds
                SELECT Id FROM Bookings
                WHERE CustomerId IN (SELECT Id FROM @CustomerIds)
                   OR DriverId IN (SELECT Id FROM @DriverIds);

                DELETE FROM Notifications WHERE CustomerId IN (SELECT Id FROM @CustomerIds);
                DELETE FROM RideRequests WHERE BookingId IN (SELECT Id FROM @BookingIds);
                DELETE FROM Payments WHERE BookingId IN (SELECT Id FROM @BookingIds);
                DELETE FROM Reviews WHERE BookingId IN (SELECT Id FROM @BookingIds);
                DELETE FROM Routes WHERE BookingId IN (SELECT Id FROM @BookingIds);
                DELETE FROM Bookings WHERE Id IN (SELECT Id FROM @BookingIds);
                DELETE FROM UserAccounts WHERE CustomerId IN (SELECT Id FROM @CustomerIds)
                    OR DriverId IN (SELECT Id FROM @DriverIds);
                DELETE FROM Customers WHERE Id IN (SELECT Id FROM @CustomerIds);
                DELETE FROM Drivers WHERE Id IN (SELECT Id FROM @DriverIds);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
