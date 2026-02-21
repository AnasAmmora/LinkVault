namespace LinkVault.Api.Models;

public class Link
{
    public int Id { get; set; }

    public string Url { get; set; } = null!;
    public string? Title { get; set; }
    public string? Description { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int CollectionId { get; set; }
    public Collection Collection { get; set; } = null!;

    public int? CategoryId { get; set; }
    public Category? Category { get; set; }

    public DateTime CreatedAt { get; set; }
}
