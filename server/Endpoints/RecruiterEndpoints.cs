using Server.Common;
using Server.Contracts;
using Server.Services;

namespace Server.Endpoints;

public static class RecruiterEndpoints
{
    public static void MapRecruiterEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/recruiters");

        group.MapGet("/", GetAll);
        group.MapGet("/{id:guid}", GetById);
        group.MapPost("/", Create);
        group.MapPut("/{id:guid}", Update);
        group.MapDelete("/{id:guid}", Delete);
    }

    private static async Task<IResult> GetAll(IRecruiterService service) =>
        Results.Ok(await service.GetAllAsync());

    private static async Task<IResult> GetById(Guid id, IRecruiterService service)
    {
        var recruiter = await service.GetByIdAsync(id);
        return recruiter is null ? Results.NotFound() : Results.Ok(recruiter);
    }

    private static async Task<IResult> Create(RecruiterRequest request, IRecruiterService service)
    {
        var result = await service.CreateAsync(request);
        return result.ToHttpResult(created =>
            Results.Created($"/api/recruiters/{created.Id}", created)
        );
    }

    private static async Task<IResult> Update(
        Guid id,
        RecruiterRequest request,
        IRecruiterService service
    )
    {
        var result = await service.UpdateAsync(id, request);
        return result.ToHttpResult(Results.Ok);
    }

    private static async Task<IResult> Delete(Guid id, IRecruiterService service)
    {
        var deleted = await service.DeleteAsync(id);
        return deleted ? Results.NoContent() : Results.NotFound();
    }
}
