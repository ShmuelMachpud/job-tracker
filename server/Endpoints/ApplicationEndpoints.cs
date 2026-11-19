using Server.Data;

namespace Server.Endpoints;

public static class ApplicationEndpoints
{
    public static void MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/applications");

        group.MapGet("/", GetAll);
        group.MapGet("/{id:guid}", GetById);
    }

    private static async Task<IResult> GetAll(IApplicationRepository repository)
    {
        var applications = await repository.GetAllAsync();
        return Results.Ok(applications);
    }

    private static async Task<IResult> GetById(Guid id, IApplicationRepository repository)
    {
        var application = await repository.GetByIdAsync(id);
        return application is null ? Results.NotFound() : Results.Ok(application);
    }
}