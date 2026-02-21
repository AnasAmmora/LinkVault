namespace LinkVault.Api.DTOs;

public record PagedResult<T>(
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages,
    List<T> Items
);
