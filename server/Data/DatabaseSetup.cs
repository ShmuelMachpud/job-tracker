using Microsoft.AspNetCore.DataProtection;
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
        services.AddScoped<IRecruiterRepository, EfRecruiterRepository>();
        services.AddScoped<IInteractionRepository, EfInteractionRepository>();

        // מפתחות ההצפנה של עוגיית ההתחברות נשמרים במסד ולא בקובץ בשרת.
        // ב־Render הקבצים נמחקים בכל עדכון גרסה והתעוררות, ובלי זה היית צריך להתחבר מחדש בכל פעם
        services
            .AddDataProtection()
            .SetApplicationName("JobTracker")
            .PersistKeysToDbContext<AppDbContext>();

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
