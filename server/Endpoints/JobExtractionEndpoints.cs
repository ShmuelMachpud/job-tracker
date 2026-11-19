using Server.Common;
using Server.Contracts;
using Server.Services;

namespace Server.Endpoints;

public static class JobExtractionEndpoints
{
    public static void MapJobExtractionEndpoints(this IEndpointRouteBuilder app)
    {
        // POST ולא GET: הבקשה גורמת לשרת לפנות לאתר חיצוני, והקישור לא אמור להופיע בכתובת
        app.MapPost("/api/job-extraction", Extract);
    }

    private static async Task<IResult> Extract(
        ExtractJobRequest request,
        IJobExtractionService service,
        CancellationToken cancellationToken
    )
    {
        var result = await service.ExtractAsync(request, cancellationToken);
        return result.ToHttpResult(Results.Ok);
    }
}
