namespace backend.Common;

public class PaginationParams
{
    private const int MaxPageSize = 100;
    private int _pageSize = 12;

    // Accept both "page" and "pageNumber" from query string
    public int Page { get; set; } = 1;
    public int PageNumber { get => Page; set => Page = value; }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }

    public int Skip => (Page - 1) * PageSize;
}
