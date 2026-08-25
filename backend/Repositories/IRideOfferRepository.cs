using backend.DTOs.RideOffer;
using backend.Enums;
using backend.Models;

namespace backend.Repositories;

public interface IRideOfferRepository : IRepository<RideOffer>
{
    Task<RideOffer?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<RideOffer>> SearchAsync(SearchRideOffersRequest request);
    Task<IEnumerable<RideOffer>> GetByDriverIdAsync(int driverId);
    Task<IEnumerable<RideOffer>> GetActiveOffersAsync();
}
