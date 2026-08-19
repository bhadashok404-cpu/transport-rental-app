using backend.Enums;

namespace backend.Models;

public class UserAccount
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public int? DriverId { get; set; }
    public Driver? Driver { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}