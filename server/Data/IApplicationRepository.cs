using Server.Models;

namespace Server.Data;

public interface IApplicationRepository
{
    Task<IReadOnlyList<JobApplication>> GetAllAsync();
    Task<JobApplication?> GetByIdAsync(Guid id);
    Task AddAsync(JobApplication application);
    Task<bool> UpdateAsync(JobApplication application);
    Task<bool> DeleteAsync(Guid id);
}