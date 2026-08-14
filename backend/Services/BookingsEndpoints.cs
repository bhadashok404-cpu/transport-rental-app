using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public static class BookingsEndpoints
{
    public static void MapBookingEndpoints(this WebApplication app)
    {
        var bookings = app.MapGroup("/api/bookings")
            .WithTags("Bookings");

        // GET /api/bookings
        bookings.MapGet("/", async (AppDbContext db) =>
        {
            var result = await db.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Vehicle)
                .AsNoTracking()
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Results.Ok(result);
        });

        // GET /api/bookings/{id}
        bookings.MapGet("/{id:int}", async (
            int id,
            AppDbContext db) =>
        {
            var booking = await db.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Vehicle)
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == id);

            return booking is null
                ? Results.NotFound()
                : Results.Ok(booking);
        });

        // POST /api/bookings
        bookings.MapPost("/", async (
            Booking booking,
            AppDbContext db) =>
        {
            if (booking.ReturnDate <= booking.PickupDate)
            {
                return Results.BadRequest(new
                {
                    message = "Return date must be after pickup date."
                });
            }

            var customerExists = await db.Customers
                .AnyAsync(c => c.Id == booking.CustomerId);

            if (!customerExists)
            {
                return Results.BadRequest(new
                {
                    message = "Customer not found."
                });
            }

            var vehicle = await db.Vehicles
                .FirstOrDefaultAsync(v => v.Id == booking.VehicleId);

            if (vehicle is null)
            {
                return Results.BadRequest(new
                {
                    message = "Vehicle not found."
                });
            }

            // Check whether the vehicle is already booked
            var vehicleAlreadyBooked = await db.Bookings.AnyAsync(b =>
                b.VehicleId == booking.VehicleId &&
                b.Status != "Cancelled" &&
                booking.PickupDate < b.ReturnDate &&
                booking.ReturnDate > b.PickupDate);

            if (vehicleAlreadyBooked)
            {
                return Results.Conflict(new
                {
                    message = "Vehicle is already booked for these dates."
                });
            }

            var days = (booking.ReturnDate.Date - booking.PickupDate.Date).Days;

            if (days <= 0)
            {
                days = 1;
            }

            booking.Id = 0;
            booking.TotalPrice = days * vehicle.PricePerDay;
            booking.Status = "Pending";
            booking.CreatedAt = DateTime.UtcNow;

            db.Bookings.Add(booking);

            await db.SaveChangesAsync();

            return Results.Created(
                $"/api/bookings/{booking.Id}",
                booking);
        });

        // PUT /api/bookings/{id}/status
        bookings.MapPut("/{id:int}/status", async (
            int id,
            BookingStatusRequest request,
            AppDbContext db) =>
        {
            var booking = await db.Bookings
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking is null)
            {
                return Results.NotFound();
            }

            var validStatuses = new[]
            {
                "Pending",
                "Confirmed",
                "Completed",
                "Cancelled"
            };

            if (!validStatuses.Contains(request.Status))
            {
                return Results.BadRequest(new
                {
                    message = "Invalid booking status."
                });
            }

            booking.Status = request.Status;

            await db.SaveChangesAsync();

            return Results.Ok(booking);
        });

        // DELETE /api/bookings/{id}
        bookings.MapDelete("/{id:int}", async (
            int id,
            AppDbContext db) =>
        {
            var booking = await db.Bookings
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking is null)
            {
                return Results.NotFound();
            }

            db.Bookings.Remove(booking);

            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}

public record BookingStatusRequest(string Status);