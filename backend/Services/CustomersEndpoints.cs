using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public static class CustomersEndpoints
{
    public static void MapCustomerEndpoints(this WebApplication app)
    {
        var customers = app.MapGroup("/api/customers")
            .WithTags("Customers");

        // GET /api/customers
        customers.MapGet("/", async (AppDbContext db) =>
        {
            var result = await db.Customers
                .AsNoTracking()
                .OrderBy(c => c.LastName)
                .ThenBy(c => c.FirstName)
                .ToListAsync();

            return Results.Ok(result);
        });

        // GET /api/customers/{id}
        customers.MapGet("/{id:int}", async (
            int id,
            AppDbContext db) =>
        {
            var customer = await db.Customers
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

            return customer is null
                ? Results.NotFound()
                : Results.Ok(customer);
        });

        // POST /api/customers
        customers.MapPost("/", async (
            Customer customer,
            AppDbContext db) =>
        {
            var emailExists = await db.Customers
                .AnyAsync(c => c.Email == customer.Email);

            if (emailExists)
            {
                return Results.Conflict(
                    new { message = "A customer with this email already exists." });
            }

            customer.Id = 0;
            customer.CreatedAt = DateTime.UtcNow;

            db.Customers.Add(customer);
            await db.SaveChangesAsync();

            return Results.Created(
                $"/api/customers/{customer.Id}",
                customer);
        });

        // PUT /api/customers/{id}
        customers.MapPut("/{id:int}", async (
            int id,
            Customer updatedCustomer,
            AppDbContext db) =>
        {
            var customer = await db.Customers
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer is null)
            {
                return Results.NotFound();
            }

            var emailExists = await db.Customers.AnyAsync(
                c => c.Email == updatedCustomer.Email &&
                     c.Id != id);

            if (emailExists)
            {
                return Results.Conflict(
                    new { message = "A customer with this email already exists." });
            }

            customer.FirstName = updatedCustomer.FirstName;
            customer.LastName = updatedCustomer.LastName;
            customer.Email = updatedCustomer.Email;
            customer.PhoneNumber = updatedCustomer.PhoneNumber;
            customer.Address = updatedCustomer.Address;

            await db.SaveChangesAsync();

            return Results.Ok(customer);
        });

        // DELETE /api/customers/{id}
        customers.MapDelete("/{id:int}", async (
            int id,
            AppDbContext db) =>
        {
            var customer = await db.Customers
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer is null)
            {
                return Results.NotFound();
            }

            db.Customers.Remove(customer);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}