namespace LinkVault.Api.DTOs;

public record LinkResponse(
    int Id,
    int CollectionId,
    int? CategoryId,
    string Url,
    string? Title,
    string? Description,
    DateTime CreatedAt
);
