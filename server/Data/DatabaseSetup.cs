using Microsoft.EntityFrameworkCore;

namespace Server.Data;

public static class DatabaseSetup
{
    public static IServiceCollection AddDatabase(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment
    )
    {
        // נתיב יחסי מחושב מתיקיית השרת. נתיב מלא (למשל בענן) נשאר כמו שהוא
        var databasePath = Path.Combine(
            environment.ContentRootPath,
            configuration["Storage:DatabasePath"] ?? "storage/jobs.db"
        );
        Directory.CreateDirectory(Path.GetDirectoryName(databasePath)!);

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite($"Data Source={databasePath}")
        );
        services.AddScoped<IApplicationRepository, SqliteApplicationRepository>();

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
