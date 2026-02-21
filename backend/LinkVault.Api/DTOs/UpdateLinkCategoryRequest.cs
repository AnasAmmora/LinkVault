namespace LinkVault.Api.DTOs;

// categoryId = null means removing the category from the link
public record UpdateLinkCategoryRequest(int? CategoryId);
