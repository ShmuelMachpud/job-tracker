using Server.Common;
using Server.Contracts;

namespace Server.Services;

public interface IJobExtractionService
{
    Task<Result<JobDetailsSuggestion>> ExtractAsync(
        ExtractJobRequest request,
        CancellationToken cancellationToken
    );
}
