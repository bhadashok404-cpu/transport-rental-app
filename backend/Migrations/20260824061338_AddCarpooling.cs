using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCarpooling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "BookingId",
                table: "Payments",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "RideOffers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DriverId = table.Column<int>(type: "int", nullable: false),
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    OriginCity = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DestinationCity = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    OriginAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DestinationAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    OriginLat = table.Column<decimal>(type: "decimal(10,7)", precision: 10, scale: 7, nullable: true),
                    OriginLng = table.Column<decimal>(type: "decimal(11,7)", precision: 11, scale: 7, nullable: true),
                    DestinationLat = table.Column<decimal>(type: "decimal(10,7)", precision: 10, scale: 7, nullable: true),
                    DestinationLng = table.Column<decimal>(type: "decimal(11,7)", precision: 11, scale: 7, nullable: true),
                    DepartureTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EstimatedDurationMinutes = table.Column<int>(type: "int", nullable: true),
                    EstimatedDistanceKm = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    TotalSeats = table.Column<int>(type: "int", nullable: false),
                    AvailableSeats = table.Column<int>(type: "int", nullable: false),
                    PricePerSeat = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    InstantBooking = table.Column<bool>(type: "bit", nullable: false),
                    SmokingAllowed = table.Column<bool>(type: "bit", nullable: false),
                    PetsAllowed = table.Column<bool>(type: "bit", nullable: false),
                    MaxPassengersInBack = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RideOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RideOffers_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RideOffers_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CarpoolBookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RideOfferId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    SeatsBooked = table.Column<int>(type: "int", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PaymentId = table.Column<int>(type: "int", nullable: true),
                    CancellationReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarpoolBookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CarpoolBookings_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CarpoolBookings_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalTable: "Payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CarpoolBookings_RideOffers_RideOfferId",
                        column: x => x.RideOfferId,
                        principalTable: "RideOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CarpoolBookings_CustomerId_Status",
                table: "CarpoolBookings",
                columns: new[] { "CustomerId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CarpoolBookings_PaymentId",
                table: "CarpoolBookings",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_CarpoolBookings_RideOfferId_CustomerId",
                table: "CarpoolBookings",
                columns: new[] { "RideOfferId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_CarpoolBookings_Status",
                table: "CarpoolBookings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_RideOffers_DepartureTime",
                table: "RideOffers",
                column: "DepartureTime");

            migrationBuilder.CreateIndex(
                name: "IX_RideOffers_DriverId",
                table: "RideOffers",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_RideOffers_OriginCity_DestinationCity_DepartureTime",
                table: "RideOffers",
                columns: new[] { "OriginCity", "DestinationCity", "DepartureTime" });

            migrationBuilder.CreateIndex(
                name: "IX_RideOffers_Status",
                table: "RideOffers",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_RideOffers_VehicleId",
                table: "RideOffers",
                column: "VehicleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CarpoolBookings");

            migrationBuilder.DropTable(
                name: "RideOffers");

            migrationBuilder.AlterColumn<int>(
                name: "BookingId",
                table: "Payments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
