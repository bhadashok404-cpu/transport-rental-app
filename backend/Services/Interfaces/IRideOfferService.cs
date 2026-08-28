using backend.Common;
using backend.DTOs.RideOffer;
using backend.Enums;

namespace backend.Services.Interfaces;

public interface IRideOfferService
{
    /// <summary>Driver creates a new ride offer.</summary>
    Task<ServiceResult<RideOfferDto>> CreateRideOfferAsync(CreateRideOfferRequest request);

    /// <summary>Search available rides by origin, destination, date and passenger count.</summary>
    Task<ServiceResult<IEnumerable<RideOfferDto>>> SearchRideOffersAsync(SearchRideOffersRequest request);

    /// <summary>Full detail view of a single ride offer including current passengers.</summary>
    Task<ServiceResult<RideOfferDto>> GetRideOfferByIdAsync(int id);

    /// <summary>All offers posted by a specific driver.</summary>
    Task<ServiceResult<IEnumerable<RideOfferDto>>> GetDriverRideOffersAsync(int driverId);

    /// <summary>Driver or admin cancels an offer. Cancels all pending/confirmed carpool bookings on it.</summary>
    Task<ServiceResult> CancelRideOfferAsync(int offerId, int requestingDriverId, bool isAdmin = false);

    /// <summary>Mark a completed trip (called after the trip date has passed).</summary>
    Task<ServiceResult> CompleteRideOfferAsync(int offerId, int requestingDriverId, bool isAdmin = false);

    /// <summary>Admin — get all ride offers across all drivers.</summary>
    Task<ServiceResult<IEnumerable<RideOfferDto>>> GetAllRideOffersAsync();
}
