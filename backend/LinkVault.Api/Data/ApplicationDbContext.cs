using LinkVault.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LinkVault.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Collection> Collections => Set<Collection>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Link> Links => Set<Link>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Table names match your SQL tables
        modelBuilder.Entity<User>().ToTable("Users");
        modelBuilder.Entity<Collection>().ToTable("Collections");
        modelBuilder.Entity<Category>().ToTable("Categories");
        modelBuilder.Entity<Link>().ToTable("Links");

        // Email unique
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Relationships
        modelBuilder.Entity<Collection>()
            .HasOne(c => c.User)
            .WithMany(u => u.Collections)
            .HasForeignKey(c => c.UserId);

        modelBuilder.Entity<Category>()
            .HasOne(c => c.User)
            .WithMany(u => u.Categories)
            .HasForeignKey(c => c.UserId);

        modelBuilder.Entity<Link>()
            .HasOne(l => l.User)
            .WithMany(u => u.Links)
            .HasForeignKey(l => l.UserId);

        modelBuilder.Entity<Link>()
            .HasOne(l => l.Collection)
            .WithMany(c => c.Links)
            .HasForeignKey(l => l.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);

        // مهم: لتفادي multiple cascade paths مع SQL Server
        modelBuilder.Entity<Link>()
            .HasOne(l => l.Category)
            .WithMany(c => c.Links)
            .HasForeignKey(l => l.CategoryId)
            .OnDelete(DeleteBehavior.NoAction); // أو Restrict
    }
}
