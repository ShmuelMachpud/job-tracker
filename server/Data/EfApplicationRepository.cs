using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public class EfApplicationRepository : IApplicationRepository
{
    private readonly AppDbContext _db;

    public EfApplicationRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<JobApplication>> GetAllAsync() =>
        await _db.Applications.AsNoTracking().ToListAsync();

    public Task<JobApplication?> GetByIdAsync(Guid id) =>
        _db.Applications.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);

    public Task<bool> ExistsAsync(Guid id) => _db.Applications.AnyAsync(a => a.Id == id);

    public async Task AddAsync(JobApplication application)
    {
        _db.Applications.Add(application);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> UpdateAsync(JobApplication application)
    {
        _db.Applications.Update(application);
        try
        {
            await _db.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            // אף שורה לא עודכנה: המשרה נמחקה בינתיים
            return false;
        }
    }

    public async Task<bool> DeleteAsync(Guid id) =>
        await _db.Applications.Where(a => a.Id == id).ExecuteDeleteAsync() > 0;
}
