using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopApi.Data;
using ShopApi.Models;

namespace ShopApi.Controllers;

[ApiController, Route("api/products")]
public class ProductsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<Product>> List(string? q, int page = 1, int pageSize = 10, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = db.Products.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(p => EF.Functions.ILike(p.Name, $"%{q.Trim()}%"));

        var total = await query.CountAsync(ct);
        var items = await query.OrderBy(p => p.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Product>(items, page, pageSize, total);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> Get(int id)
    {
        var product = await db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        return product is null ? NotFound() : product;
    }

    [HttpPost, Authorize]
    public async Task<ActionResult<Product>> Create(ProductInput input)
    {
        var product = new Product
        {
            Name = input.Name.Trim(),
            Description = input.Description?.Trim() ?? "",
            Price = input.Price,
            Stock = input.Stock
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}"), Authorize]
    public async Task<ActionResult<Product>> Update(int id, ProductInput input)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound();

        product.Name = input.Name.Trim();
        product.Description = input.Description?.Trim() ?? "";
        product.Price = input.Price;
        product.Stock = input.Stock;
        await db.SaveChangesAsync();
        return product;
    }

    [HttpDelete("{id:int}"), Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound();

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
