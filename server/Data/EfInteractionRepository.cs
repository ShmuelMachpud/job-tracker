using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public class EfInteractionRepository : IInteractionRepository
{
    private readonly AppDbContext _db;

    public EfInteractionRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<Interaction>> GetAllAsync() =>
        await _db.Interactions.AsNoTracking().ToListAsync();

    public Task<Interaction?> GetByIdAsync(Guid id) =>
        _db.Interactions.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);

    public async Task AddAsync(Interaction interaction, Recruiter recruiter)
    {
        _db.Interactions.Add(interaction);
        _db.Recruiters.Update(recruiter);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> UpdateAsync(Interaction interaction, Recruiter recruiter)
    {
        _db.Interactions.Update(interaction);
        _db.Recruiters.Update(recruiter);
        try
        {
            await _db.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            // הרשומה או המגייס נמחקו בינתיים
            return false;
        }
    }

    public async Task<bool> DeleteAsync(Guid id) =>
        await _db.Interactions.Where(i => i.Id == id).ExecuteDeleteAsync() > 0;
}
