namespace backend.Models;

public class Booking
{
    public int Id { get; set; }

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;

    public DateTime PickupDate { get; set; }

    public DateTime ReturnDate { get; set; }

    public decimal TotalPrice { get; set; }

    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}