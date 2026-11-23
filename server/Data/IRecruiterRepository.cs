using Server.Models;

namespace Server.Data;

public interface IRecruiterRepository
{
    Task<IReadOnlyList<Recruiter>> GetAllAsync();
    Task<Recruiter?> GetByIdAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task AddAsync(Recruiter recruiter);
    Task<bool> UpdateAsync(Recruiter recruiter);
    Task<bool> DeleteAsync(Guid id);
}
