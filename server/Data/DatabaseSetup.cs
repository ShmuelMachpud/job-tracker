using Microsoft.EntityFrameworkCore;

namespace Server.Data;

public static class DatabaseSetup
{
    public static IServiceCollection AddDatabase(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        var connectionString = configuration.GetConnectionString("Jobs")
            ?? throw new InvalidOperationException(
                "חסרה מחרוזת החיבור ConnectionStrings:Jobs. במחשב: dotnet user-secrets. בענן: משתנה סביבה."
            );

        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<IApplicationRepository, EfApplicationRepository>();

        return services;
    }

    /// <summary>יוצר את המסד אם אינו קיים, ומעדכן אותו למבנה האחרון.</summary>
    public static async Task PrepareDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
    }
}
