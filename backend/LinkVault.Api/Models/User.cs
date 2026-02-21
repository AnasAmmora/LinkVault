namespace LinkVault.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public ICollection<Collection> Collections { get; set; } = new List<Collection>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Link> Links { get; set; } = new List<Link>();
}
