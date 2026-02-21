using LinkVault.Api.Data;
using LinkVault.Api.DTOs;
using LinkVault.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LinkVault.Api.Controllers;

[ApiController]
[Route("api/collections")]
[Authorize]
public class CollectionsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CollectionsController(ApplicationDbContext db)
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
    public async Task<ActionResult<CollectionResponse>> Create(CreateCollectionRequest req)
    {
        var userId = GetUserId();

        var name = (req.Name ?? "").Trim();
        if (name.Length == 0) return BadRequest("Name is required.");
        if (name.Length > 120) return BadRequest("Name is too long (max 120).");

        var exists = await _db.Collections.AnyAsync(c => c.UserId == userId && c.Name == name);
        if (exists) return Conflict("Collection name already exists.");

        var collection = new Collection
        {
            Name = name,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Collections.Add(collection);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById),
            new { id = collection.Id },
            new CollectionResponse(collection.Id, collection.Name, collection.CreatedAt));
    }

    // READ ALL (for current user)
    [HttpGet]
    public async Task<ActionResult<PagedResult<CollectionResponse>>> GetAll(
        [FromQuery] string? q,
        [FromQuery] string? sort = "newest",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20
    )
    {
        var userId = GetUserId();

        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        var query = _db.Collections
            .AsNoTracking()
            .Where(c => c.UserId == userId);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(c => c.Name.Contains(term));
        }

        query = (sort?.ToLower()) switch
        {
            "name" => query.OrderBy(c => c.Name),
            "oldest" => query.OrderBy(c => c.CreatedAt),
            _ => query.OrderByDescending(c => c.CreatedAt) // newest
        };

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CollectionResponse(c.Id, c.Name, c.CreatedAt))
            .ToListAsync();

        return Ok(new PagedResult<CollectionResponse>(page, pageSize, totalCount, totalPages, items));
    }


    // READ ONE
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CollectionResponse>> GetById(int id)
    {
        var userId = GetUserId();

        var c = await _db.Collections
            .Where(x => x.UserId == userId && x.Id == id)
            .Select(x => new CollectionResponse(x.Id, x.Name, x.CreatedAt))
            .FirstOrDefaultAsync();

        if (c is null) return NotFound();
        return Ok(c);
    }

    // UPDATE
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateCollectionRequest req)
    {
        var userId = GetUserId();

        var name = (req.Name ?? "").Trim();
        if (name.Length == 0) return BadRequest("Name is required.");
        if (name.Length > 120) return BadRequest("Name is too long (max 120).");

        var collection = await _db.Collections.FirstOrDefaultAsync(c => c.UserId == userId && c.Id == id);
        if (collection is null) return NotFound();

        var duplicate = await _db.Collections.AnyAsync(c => c.UserId == userId && c.Name == name && c.Id != id);
        if (duplicate) return Conflict("Collection name already exists.");

        collection.Name = name;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // DELETE
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();

        var collection = await _db.Collections.FirstOrDefaultAsync(c => c.UserId == userId && c.Id == id);
        if (collection is null) return NotFound();

        _db.Collections.Remove(collection);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
