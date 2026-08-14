using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public static class VehiclesEndpoints
{
    public static void MapVehicleEndpoints(this WebApplication app)
    {
        var vehicles = app.MapGroup("/api/vehicles")
            .WithTags("Vehicles");

        // GET: /api/vehicles
        vehicles.MapGet("/", async (AppDbContext db) =>
        {
            var result = await db.Vehicles
                .AsNoTracking()
                .ToListAsync();

            return Results.Ok(result);
        });

        // GET: /api/vehicles/{id}
        vehicles.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            var vehicle = await db.Vehicles
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == id);

            return vehicle is null
                ? Results.NotFound()
                : Results.Ok(vehicle);
        });

        // POST: /api/vehicles
        vehicles.MapPost("/", async (Vehicle vehicle, AppDbContext db) =>
        {
            db.Vehicles.Add(vehicle);
            await db.SaveChangesAsync();

            return Results.Created(
                $"/api/vehicles/{vehicle.Id}",
                vehicle);
        });

        // PUT: /api/vehicles/{id}
        vehicles.MapPut("/{id:int}", async (
            int id,
            Vehicle updatedVehicle,
            AppDbContext db) =>
        {
            var vehicle = await db.Vehicles
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle is null)
            {
                return Results.NotFound();
            }

            vehicle.RegistrationNumber = updatedVehicle.RegistrationNumber;
            vehicle.Make = updatedVehicle.Make;
            vehicle.Model = updatedVehicle.Model;
            vehicle.Year = updatedVehicle.Year;
            vehicle.VehicleType = updatedVehicle.VehicleType;
            vehicle.PricePerDay = updatedVehicle.PricePerDay;
            vehicle.IsAvailable = updatedVehicle.IsAvailable;

            await db.SaveChangesAsync();

            return Results.Ok(vehicle);
        });

        // DELETE: /api/vehicles/{id}
        vehicles.MapDelete("/{id:int}", async (
            int id,
            AppDbContext db) =>
        {
            var vehicle = await db.Vehicles
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle is null)
            {
                return Results.NotFound();
            }

            db.Vehicles.Remove(vehicle);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}