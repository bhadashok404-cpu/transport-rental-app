using backend.Enums;

namespace backend.Models;

public class Booking
{
    public int Id { get; set; }

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;

    public int? DriverId { get; set; }
    public Driver? Driver { get; set; }

    public string PickupLocation { get; set; } = string.Empty;

    public string DropLocation { get; set; } = string.Empty;

    public DateTime PickupDate { get; set; }

    public DateTime? ReturnDate { get; set; }

    public DateTime? ActualPickupTime { get; set; }

    public DateTime? ActualDropTime { get; set; }

    public decimal EstimatedPrice { get; set; }

    public decimal? ActualPrice { get; set; }

    public decimal? DiscountAmount { get; set; }

    public int? CouponId { get; set; }
    public Coupon? Coupon { get; set; }

    public decimal? DistanceInKm { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public string? CancellationReason { get; set; }

    public DateTime? CancelledAt { get; set; }

    public string? SpecialInstructions { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public Route? Route { get; set; }
}