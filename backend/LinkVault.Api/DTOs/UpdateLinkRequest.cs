namespace LinkVault.Api.DTOs;

public record UpdateLinkRequest(
    string Url,
    string? Title,
    string? Description,
    int? CategoryId
);
