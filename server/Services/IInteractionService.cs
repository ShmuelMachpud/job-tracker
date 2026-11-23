using Server.Common;
using Server.Contracts;
using Server.Models;

namespace Server.Services;

public interface IInteractionService
{
    Task<IReadOnlyList<Interaction>> GetAllAsync();
    Task<Result<InteractionResponse>> CreateAsync(InteractionRequest request);
    Task<Result<InteractionResponse>> UpdateAsync(Guid id, InteractionRequest request);
    Task<bool> DeleteAsync(Guid id);
}
