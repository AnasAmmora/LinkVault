using LinkVault.Api.Data;
using LinkVault.Api.DTOs;
using LinkVault.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LinkVault.Api.Controllers;

[ApiController]
[Authorize]
public class LinksController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public LinksController(ApplicationDbContext db)
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

    // CREATE (inside a collection)
    [HttpPost("api/collections/{collectionId:int}/links")]
    public async Task<ActionResult<LinkResponse>> Create(int collectionId, CreateLinkRequest req)
    {
        var userId = GetUserId();

        var url = (req.Url ?? "").Trim();
        if (url.Length == 0) return BadRequest("Url is required.");
        if (url.Length > 2048) return BadRequest("Url is too long (max 2048).");

        // ensure collection belongs to current user
        var collectionExists = await _db.Collections.AnyAsync(c => c.Id == collectionId && c.UserId == userId);
        if (!collectionExists) return NotFound("Collection not found.");

        // optional: ensure category belongs to current user (if provided)
        if (req.CategoryId.HasValue)
        {
            var catOk = await _db.Categories.AnyAsync(c => c.Id == req.CategoryId.Value && c.UserId == userId);
            if (!catOk) return BadRequest("Invalid categoryId.");
        }

        var link = new Link
        {
            Url = url,
            Title = string.IsNullOrWhiteSpace(req.Title) ? null : req.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            CategoryId = req.CategoryId,
            UserId = userId,
            CollectionId = collectionId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Links.Add(link);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = link.Id }, ToResponse(link));
    }

    // LIST (inside a collection) + Search/Filter
    // GET /api/collections/{collectionId}/links?q=...&categoryId=...&from=...&to=...&sort=newest|oldest
    [HttpGet("api/collections/{collectionId:int}/links")]
    public async Task<ActionResult<PagedResult<LinkResponse>>> GetByCollection(
    int collectionId,
    [FromQuery] string? q,
    [FromQuery] int? categoryId,
    [FromQuery] string? sort = "newest",
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20
)
    {
        var userId = GetUserId();

        // ضبط القيم
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        // تأكد collection للمستخدم
        var collectionOk = await _db.Collections
            .AnyAsync(c => c.Id == collectionId && c.UserId == userId);

        if (!collectionOk) return NotFound("Collection not found.");

        // Query أساسي
        var query = _db.Links
            .AsNoTracking()
            .Where(l => l.UserId == userId && l.CollectionId == collectionId);

        // Filter: Category
        if (categoryId.HasValue)
            query = query.Where(l => l.CategoryId == categoryId.Value);

        // Search: q
        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(l =>
                l.Url.Contains(term) ||
                (l.Title != null && l.Title.Contains(term)) ||
                (l.Description != null && l.Description.Contains(term))
            );
        }

        // Sorting
        query = (sort?.ToLower()) switch
        {
            "oldest" => query.OrderBy(l => l.CreatedAt),
            _ => query.OrderByDescending(l => l.CreatedAt) // newest
        };

        // Counts
        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        // Pagination
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new LinkResponse(
                l.Id,
                l.CollectionId,
                l.CategoryId,
                l.Url,
                l.Title,
                l.Description,
                l.CreatedAt
            ))
            .ToListAsync();

        return Ok(new PagedResult<LinkResponse>(
            page,
            pageSize,
            totalCount,
            totalPages,
            items
        ));
    }

    // READ ONE (by id) - must belong to current user
    [HttpGet("api/links/{id:int}")]
    public async Task<ActionResult<LinkResponse>> GetById(int id)
    {
        var userId = GetUserId();

        var link = await _db.Links
            .AsNoTracking()
            .Where(l => l.Id == id && l.UserId == userId)
            .Select(l => new LinkResponse(l.Id, l.CollectionId, l.CategoryId, l.Url, l.Title, l.Description, l.CreatedAt))
            .FirstOrDefaultAsync();

        if (link is null) return NotFound();
        return Ok(link);
    }

    // UPDATE
    [HttpPut("api/links/{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateLinkRequest req)
    {
        var userId = GetUserId();

        var url = (req.Url ?? "").Trim();
        if (url.Length == 0) return BadRequest("Url is required.");
        if (url.Length > 2048) return BadRequest("Url is too long (max 2048).");

        var link = await _db.Links.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (link is null) return NotFound();

        if (req.CategoryId.HasValue)
        {
            var catOk = await _db.Categories.AnyAsync(c => c.Id == req.CategoryId.Value && c.UserId == userId);
            if (!catOk) return BadRequest("Invalid categoryId.");
        }

        link.Url = url;
        link.Title = string.IsNullOrWhiteSpace(req.Title) ? null : req.Title.Trim();
        link.Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim();
        link.CategoryId = req.CategoryId;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE
    [HttpDelete("api/links/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();

        var link = await _db.Links.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (link is null) return NotFound();

        _db.Links.Remove(link);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("api/links/{id:int}/move")]
    public async Task<IActionResult> Move(int id, MoveLinkRequest req)
    {
        var userId = GetUserId();

        if (req.TargetCollectionId <= 0)
            return BadRequest("TargetCollectionId is required.");


        var link = await _db.Links.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (link is null) return NotFound("Link not found.");


        var targetOk = await _db.Collections.AnyAsync(c => c.Id == req.TargetCollectionId && c.UserId == userId);
        if (!targetOk) return NotFound("Target collection not found.");


        if (link.CollectionId == req.TargetCollectionId)
            return NoContent();

        link.CollectionId = req.TargetCollectionId;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static LinkResponse ToResponse(Link l)
        => new(l.Id, l.CollectionId, l.CategoryId, l.Url, l.Title, l.Description, l.CreatedAt);
}
