using Server.Common;
using Server.Contracts;
using Server.Models;
using Server.Services;

namespace Server.Endpoints;

public static class ApplicationEndpoints
{
    public static void MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/applications");

        group.MapGet("/", GetAll);
        group.MapGet("/{id:guid}", GetById);
        group.MapPost("/", Create);
        group.MapPut("/{id:guid}", Update);
        group.MapPatch("/{id:guid}/status", ChangeStatus);
        group.MapDelete("/{id:guid}", Delete);
    }

    private static async Task<IResult> GetAll(IApplicationService service)
    {
        var applications = await service.GetAllAsync();
        return Results.Ok(applications);
    }

    private static async Task<IResult> GetById(Guid id, IApplicationService service)
    {
        var application = await service.GetByIdAsync(id);
        return application is null ? Results.NotFound() : Results.Ok(application);
    }

    private static async Task<IResult> Create(
        CreateApplicationRequest request,
        IApplicationService service
    )
    {
        var result = await service.CreateAsync(request);
        return result.ToHttpResult(created =>
            Results.Created($"/api/applications/{created.Id}", created)
        );
    }

    private static async Task<IResult> Update(
        Guid id,
        ApplicationDetailsRequest request,
        IApplicationService service
    )
    {
        var result = await service.UpdateAsync(id, request);
        return result.ToHttpResult(Results.Ok);
    }

    private static async Task<IResult> ChangeStatus(
        Guid id,
        ChangeStatusRequest request,
        IApplicationService service
    )
    {
        var result = await service.ChangeStatusAsync(id, request);
        return result.ToHttpResult(Results.Ok);
    }

    private static async Task<IResult> Delete(Guid id, IApplicationService service)
    {
        var deleted = await service.DeleteAsync(id);
        return deleted ? Results.NoContent() : Results.NotFound();
    }
}
