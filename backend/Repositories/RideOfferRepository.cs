using backend.Data;
using backend.DTOs.RideOffer;
using backend.Enums;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class RideOfferRepository : Repository<RideOffer>, IRideOfferRepository
{
    public RideOfferRepository(AppDbContext context) : base(context) { }

    public async Task<RideOffer?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(o => o.Driver)
            .Include(o => o.Vehicle)
                .ThenInclude(v => v.VehicleCategory)
            .Include(o => o.CarpoolBookings.Where(cb => cb.Status != CarpoolBookingStatus.Cancelled))
                .ThenInclude(cb => cb.Customer)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<IEnumerable<RideOffer>> SearchAsync(SearchRideOffersRequest request)
    {
        var query = _dbSet
            .Include(o => o.Driver)
            .Include(o => o.Vehicle)
            .Where(o =>
                o.Status == RideOfferStatus.Active &&
                o.AvailableSeats >= request.Passengers &&
                o.DepartureTime.Date == request.Date.Date &&
                EF.Functions.Like(o.OriginCity, $"%{request.OriginCity}%") &&
                EF.Functions.Like(o.DestinationCity, $"%{request.DestinationCity}%"));

        if (request.MaxPricePerSeat.HasValue)
            query = query.Where(o => o.PricePerSeat <= request.MaxPricePerSeat.Value);

        if (request.InstantBookingOnly == true)
            query = query.Where(o => o.InstantBooking);

        query = request.SortBy switch
        {
            RideOfferSortBy.LowestPrice        => query.OrderBy(o => o.PricePerSeat).ThenBy(o => o.DepartureTime),
            RideOfferSortBy.HighestDriverRating => query.OrderByDescending(o => o.Driver.Rating).ThenBy(o => o.DepartureTime),
            _                                   => query.OrderBy(o => o.DepartureTime)
        };

        return await query.ToListAsync();
    }

    public async Task<IEnumerable<RideOffer>> GetByDriverIdAsync(int driverId)
    {
        return await _dbSet
            .Include(o => o.Vehicle)
            .Include(o => o.CarpoolBookings.Where(cb => cb.Status != CarpoolBookingStatus.Cancelled))
                .ThenInclude(cb => cb.Customer)
            .Where(o => o.DriverId == driverId)
            .OrderByDescending(o => o.DepartureTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<RideOffer>> GetActiveOffersAsync()
    {
        return await _dbSet
            .Include(o => o.Driver)
            .Include(o => o.Vehicle)
            .Where(o => o.Status == RideOfferStatus.Active && o.DepartureTime > DateTime.UtcNow)
            .OrderBy(o => o.DepartureTime)
            .ToListAsync();
    }
}
