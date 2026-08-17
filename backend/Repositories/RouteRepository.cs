using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class RouteRepository : Repository<backend.Models.Route>, IRouteRepository
{
    public RouteRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<backend.Models.Route?> GetByBookingIdAsync(int bookingId)
    {
        return await _dbSet
            .Include(r => r.Booking)
            .FirstOrDefaultAsync(r => r.BookingId == bookingId);
    }
}
