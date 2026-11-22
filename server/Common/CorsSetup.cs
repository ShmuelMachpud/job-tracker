namespace Server.Common;

public static class CorsSetup
{
    private const string ClientPolicy = "Client";

    /// <summary>
    /// האתרים שמותר להם לפנות לשרת מכתובת אחרת. בפיתוח: האתר על פורט 4200.
    /// בענן הרשימה ריקה, כי האתר והשרת יושבים באותה כתובת.
    /// </summary>
    public static string[] AllowedOrigins(IConfiguration configuration) =>
        configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

    public static IServiceCollection AddClientCors(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        var allowedOrigins = AllowedOrigins(configuration);

        services.AddCors(options =>
            options.AddPolicy(
                ClientPolicy,
                policy =>
                    policy
                        .WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        // מאפשר לאתר לשלוח את עוגיית ההתחברות. בטוח רק כי הרשימה מוגבלת ולא "כל אתר"
                        .AllowCredentials()
            )
        );

        return services;
    }

    public static IApplicationBuilder UseClientCors(this IApplicationBuilder app) =>
        app.UseCors(ClientPolicy);
}
