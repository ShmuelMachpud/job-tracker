using Server.Common;
using Server.Contracts;
using Server.Models;

namespace Server.Services;

public interface IApplicationService
{
    Task<IReadOnlyList<JobApplication>> GetAllAsync();
    Task<JobApplication?> GetByIdAsync(Guid id);
    Task<Result<JobApplication>> CreateAsync(CreateApplicationRequest request);
    Task<Result<JobApplication>> UpdateAsync(Guid id, ApplicationDetailsRequest request);
    Task<Result<JobApplication>> ChangeStatusAsync(Guid id, ChangeStatusRequest request);
    Task<bool> DeleteAsync(Guid id);
}
