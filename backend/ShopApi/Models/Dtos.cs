using System.ComponentModel.DataAnnotations;

namespace ShopApi.Models;

public record AuthRequest([Required, EmailAddress] string Email, [Required, MinLength(8)] string Password);

public record AuthResponse(string Token, string Email);

public record ProductInput(
    [Required, StringLength(120)] string Name,
    [StringLength(2000)] string? Description,
    [Range(0.01, 1_000_000)] decimal Price,
    [Range(0, 100_000)] int Stock);

public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int Total);
