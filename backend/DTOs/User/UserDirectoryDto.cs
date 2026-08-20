using backend.Common;

namespace backend.DTOs.User;

public class UserDirectoryDto
{
    public PagedResult<UserSummaryDto> Users { get; set; } = new();
    public int TotalUsers { get; set; }
    public int AdminCount { get; set; }
    public int CustomerCount { get; set; }
    public int DriverCount { get; set; }
}
