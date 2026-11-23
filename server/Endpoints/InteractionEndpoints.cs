using Server.Common;
using Server.Contracts;
using Server.Services;

namespace Server.Endpoints;

public static class InteractionEndpoints
{
    public static void MapInteractionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/interactions");

        group.MapGet("/", GetAll);
        group.MapPost("/", Create);
        group.MapPut("/{id:guid}", Update);
        group.MapDelete("/{id:guid}", Delete);
    }

    private static async Task<IResult> GetAll(IInteractionService service) =>
        Results.Ok(await service.GetAllAsync());

    private static async Task<IResult> Create(
        InteractionRequest request,
        IInteractionService service
    )
    {
        var result = await service.CreateAsync(request);
        return result.ToHttpResult(created =>
            Results.Created($"/api/interactions/{created.Interaction.Id}", created)
        );
    }

    private static async Task<IResult> Update(
        Guid id,
        InteractionRequest request,
        IInteractionService service
    )
    {
        var result = await service.UpdateAsync(id, request);
        return result.ToHttpResult(Results.Ok);
    }

    private static async Task<IResult> Delete(Guid id, IInteractionService service)
    {
        var deleted = await service.DeleteAsync(id);
        return deleted ? Results.NoContent() : Results.NotFound();
    }
}
