namespace backend.Repositories;

public interface IRouteRepository : IRepository<backend.Models.Route>
{
    Task<backend.Models.Route?> GetByBookingIdAsync(int bookingId);
}
