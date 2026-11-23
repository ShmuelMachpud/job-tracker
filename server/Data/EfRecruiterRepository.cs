using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public class EfRecruiterRepository : IRecruiterRepository
{
    private readonly AppDbContext _db;

    public EfRecruiterRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<Recruiter>> GetAllAsync() =>
        await _db.Recruiters.AsNoTracking().ToListAsync();

    public Task<Recruiter?> GetByIdAsync(Guid id) =>
        _db.Recruiters.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);

    public Task<bool> ExistsAsync(Guid id) => _db.Recruiters.AnyAsync(r => r.Id == id);

    public async Task AddAsync(Recruiter recruiter)
    {
        _db.Recruiters.Add(recruiter);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> UpdateAsync(Recruiter recruiter)
    {
        _db.Recruiters.Update(recruiter);
        try
        {
            await _db.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            // אף שורה לא עודכנה: המגייס נמחק בינתיים
            return false;
        }
    }

    /// <summary>המשרות של המגייס לא נמחקות: המסד מנתק אותן (ON DELETE SET NULL).</summary>
    public async Task<bool> DeleteAsync(Guid id) =>
        await _db.Recruiters.Where(r => r.Id == id).ExecuteDeleteAsync() > 0;
}
