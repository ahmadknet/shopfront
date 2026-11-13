using Microsoft.EntityFrameworkCore;
using ShopApi.Models;

namespace ShopApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>().HasIndex(u => u.Email).IsUnique();

        b.Entity<Product>().Property(p => p.Price).HasPrecision(12, 2);
        b.Entity<Product>().HasIndex(p => p.Name);

        var seeded = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        b.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Mechanical keyboard", Description = "Tenkeyless, brown switches", Price = 5499m, Stock = 25, CreatedAt = seeded },
            new Product { Id = 2, Name = "27-inch monitor", Description = "QHD IPS, 75 Hz", Price = 18999m, Stock = 12, CreatedAt = seeded },
            new Product { Id = 3, Name = "USB-C dock", Description = "8-in-1, 100 W pass-through", Price = 4299m, Stock = 40, CreatedAt = seeded },
            new Product { Id = 4, Name = "Laptop stand", Description = "Aluminium, adjustable height", Price = 1899m, Stock = 60, CreatedAt = seeded },
            new Product { Id = 5, Name = "Webcam 1080p", Description = "Autofocus, built-in mic", Price = 2999m, Stock = 18, CreatedAt = seeded });
    }
}
