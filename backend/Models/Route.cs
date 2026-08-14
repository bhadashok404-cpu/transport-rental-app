namespace backend.Models;

public class Route
{
    public int Id { get; set; }

    public int BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    public string StartLocation { get; set; } = string.Empty;

    public string EndLocation { get; set; } = string.Empty;

    public decimal? StartLatitude { get; set; }

    public decimal? StartLongitude { get; set; }

    public decimal? EndLatitude { get; set; }

    public decimal? EndLongitude { get; set; }

    public decimal DistanceInKm { get; set; }

    public int EstimatedDurationMinutes { get; set; }

    public int? ActualDurationMinutes { get; set; }

    public string? RoutePolyline { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
