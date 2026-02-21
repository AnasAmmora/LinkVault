namespace LinkVault.Api.DTOs;

public record CreateLinkRequest(
    string Url,
    string? Title,
    string? Description,
    int? CategoryId
);
