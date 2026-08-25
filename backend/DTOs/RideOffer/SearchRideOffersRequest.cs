namespace backend.DTOs.RideOffer;

public class SearchRideOffersRequest
{
    public string OriginCity { get; set; } = string.Empty;
    public string DestinationCity { get; set; } = string.Empty;

    /// <summary>Departure date (time-of-day is ignored — full day is searched).</summary>
    public DateTime Date { get; set; } = DateTime.UtcNow.Date;

    /// <summary>Minimum available seats required.</summary>
    public int Passengers { get; set; } = 1;

    // Optional filters
    public decimal? MaxPricePerSeat { get; set; }
    public bool? InstantBookingOnly { get; set; }

    // Sorting
    public RideOfferSortBy SortBy { get; set; } = RideOfferSortBy.EarliestDeparture;
}

public enum RideOfferSortBy
{
    EarliestDeparture = 0,
    LowestPrice = 1,
    HighestDriverRating = 2
}
