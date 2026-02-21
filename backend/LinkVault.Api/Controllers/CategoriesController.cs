using LinkVault.Api.Data;
using LinkVault.Api.DTOs;
using LinkVault.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LinkVault.Api.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CategoriesController(ApplicationDbContext db)
    {
        _db = db;
    }

    private int GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId))
            throw new UnauthorizedAccessException("Invalid token user id.");
        return userId;
    }

    // CREATE
    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> Create(CreateCategoryRequest req)
    {
        var userId = GetUserId();

        var name = (req.Name ?? "").Trim();
        if (name.Length == 0) return BadRequest("Name is required.");
        if (name.Length > 80) return BadRequest("Name is too long (max 80).");

        var exists = await _db.Categories.AnyAsync(c => c.UserId == userId && c.Name == name);
        if (exists) return Conflict("Category name already exists.");

        var category = new Category
        {
            Name = name,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById),
            new { id = category.Id },
            new CategoryResponse(category.Id, category.Name, category.CreatedAt));
    }

    // READ ALL
    [HttpGet]
    public async Task<ActionResult<List<CategoryResponse>>> GetAll()
    {
        var userId = GetUserId();

        var items = await _db.Categories
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponse(c.Id, c.Name, c.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }

    // READ ONE
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryResponse>> GetById(int id)
    {
        var userId = GetUserId();

        var item = await _db.Categories
            .AsNoTracking()
            .Where(c => c.UserId == userId && c.Id == id)
            .Select(c => new CategoryResponse(c.Id, c.Name, c.CreatedAt))
            .FirstOrDefaultAsync();

        if (item is null) return NotFound();
        return Ok(item);
    }

    // UPDATE
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateCategoryRequest req)
    {
        var userId = GetUserId();

        var name = (req.Name ?? "").Trim();
        if (name.Length == 0) return BadRequest("Name is required.");
        if (name.Length > 80) return BadRequest("Name is too long (max 80).");

        var category = await _db.Categories.FirstOrDefaultAsync(c => c.UserId == userId && c.Id == id);
        if (category is null) return NotFound();

        var duplicate = await _db.Categories.AnyAsync(c => c.UserId == userId && c.Name == name && c.Id != id);
        if (duplicate) return Conflict("Category name already exists.");

        category.Name = name;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // DELETE 
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();

        var category = await _db.Categories.FirstOrDefaultAsync(c => c.UserId == userId && c.Id == id);
        if (category is null) return NotFound();

        // unlink links (CategoryId = NULL) before deleting category
        await _db.Links
            .Where(l => l.UserId == userId && l.CategoryId == id)
            .ExecuteUpdateAsync(s => s.SetProperty(l => l.CategoryId, (int?)null));

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
