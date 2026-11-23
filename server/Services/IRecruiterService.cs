using Server.Common;
using Server.Contracts;
using Server.Models;

namespace Server.Services;

public interface IRecruiterService
{
    Task<IReadOnlyList<Recruiter>> GetAllAsync();
    Task<Recruiter?> GetByIdAsync(Guid id);
    Task<Result<Recruiter>> CreateAsync(RecruiterRequest request);
    Task<Result<Recruiter>> UpdateAsync(Guid id, RecruiterRequest request);
    Task<bool> DeleteAsync(Guid id);
}
