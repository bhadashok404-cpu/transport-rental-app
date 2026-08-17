namespace backend.Models;

public class Review
{
    public int Id { get; set; }

    public int BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public int? DriverId { get; set; }
    public Driver? Driver { get; set; }

    public int? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public bool IsDriverReview { get; set; }

    public bool IsVehicleReview { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
