using backend.Common;
using backend.DTOs.RideOffer;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/ride-offers")]
public class RideOffersController : ControllerBase
{
    private readonly IRideOfferService _rideOfferService;

    public RideOffersController(IRideOfferService rideOfferService)
    {
        _rideOfferService = rideOfferService;
    }

    /// <summary>
    /// Admin — get all ride offers across all drivers.
    /// GET /api/ride-offers
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<RideOfferDto>>>> GetAll()
    {
        var result = await _rideOfferService.GetAllRideOffersAsync();
        return result.IsSuccess
            ? Ok(ApiResponse<IEnumerable<RideOfferDto>>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<IEnumerable<RideOfferDto>>.ErrorResponse(result.Message));
    }

    /// <summary>
    /// Search available rides. Public — no auth required.
    /// GET /api/ride-offers/search?originCity=Pune&amp;destinationCity=Mumbai&amp;date=2026-08-25&amp;passengers=1
    /// </summary>
    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<RideOfferDto>>>> Search(
        [FromQuery] SearchRideOffersRequest request)
    {
        var result = await _rideOfferService.SearchRideOffersAsync(request);
        return result.IsSuccess
            ? Ok(ApiResponse<IEnumerable<RideOfferDto>>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<IEnumerable<RideOfferDto>>.ErrorResponse(result.Message, result.Errors));
    }

    /// <summary>
    /// Get a single ride offer with full passenger list.
    /// Public — no auth required (used for the ride detail page before login).
    /// GET /api/ride-offers/{id}
    /// </summary>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<RideOfferDto>>> GetById(int id)
    {
        var result = await _rideOfferService.GetRideOfferByIdAsync(id);
        return result.IsSuccess
            ? Ok(ApiResponse<RideOfferDto>.SuccessResponse(result.Data!, result.Message))
            : NotFound(ApiResponse<RideOfferDto>.ErrorResponse(result.Message));
    }

    /// <summary>
    /// All offers posted by a driver.
    /// GET /api/ride-offers/driver/{driverId}
    /// </summary>
    [HttpGet("driver/{driverId:int}")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<IEnumerable<RideOfferDto>>>> GetByDriver(int driverId)
    {
        if (!CanDriverAccess(driverId))
            return Forbid();

        var result = await _rideOfferService.GetDriverRideOffersAsync(driverId);
        return result.IsSuccess
            ? Ok(ApiResponse<IEnumerable<RideOfferDto>>.SuccessResponse(result.Data!, result.Message))
            : BadRequest(ApiResponse<IEnumerable<RideOfferDto>>.ErrorResponse(result.Message, result.Errors));
    }

    /// <summary>
    /// Driver creates a new ride offer.
    /// POST /api/ride-offers
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Driver")]
    public async Task<ActionResult<ApiResponse<RideOfferDto>>> Create([FromBody] CreateRideOfferRequest request)
    {
        // Overwrite DriverId from JWT so clients cannot impersonate another driver
        var driverId = GetClaimId("driverId");
        if (!driverId.HasValue)
            return Forbid();

        request.DriverId = driverId.Value;

        var result = await _rideOfferService.CreateRideOfferAsync(request);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id },
                ApiResponse<RideOfferDto>.SuccessResponse(result.Data, result.Message))
            : BadRequest(ApiResponse<RideOfferDto>.ErrorResponse(result.Message, result.Errors));
    }

    /// <summary>
    /// Driver or admin cancels a ride offer (also cancels all bookings on it).
    /// PATCH /api/ride-offers/{id}/cancel
    /// </summary>
    [HttpPatch("{id:int}/cancel")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<object>>> Cancel(int id)
    {
        bool isAdmin = User.IsInRole("Admin");
        int driverId = GetClaimId("driverId") ?? 0;

        var result = await _rideOfferService.CancelRideOfferAsync(id, driverId, isAdmin);
        return result.IsSuccess
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }

    /// <summary>
    /// Driver or admin marks a ride offer as completed.
    /// PATCH /api/ride-offers/{id}/complete
    /// </summary>
    [HttpPatch("{id:int}/complete")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<ActionResult<ApiResponse<object>>> Complete(int id)
    {
        bool isAdmin = User.IsInRole("Admin");
        int driverId = GetClaimId("driverId") ?? 0;

        var result = await _rideOfferService.CompleteRideOfferAsync(id, driverId, isAdmin);
        return result.IsSuccess
            ? Ok(ApiResponse<object>.SuccessResponse(null!, result.Message))
            : BadRequest(ApiResponse<object>.ErrorResponse(result.Message, result.Errors));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private bool CanDriverAccess(int driverId) =>
        User.IsInRole("Admin") ||
        (int.TryParse(User.FindFirst("driverId")?.Value, out var id) && id == driverId);

    private int? GetClaimId(string claimType) =>
        int.TryParse(User.FindFirst(claimType)?.Value, out var id) ? id : null;
}
