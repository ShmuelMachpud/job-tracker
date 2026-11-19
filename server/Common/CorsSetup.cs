namespace Server.Common;

public static class CorsSetup
{
    private const string ClientPolicy = "Client";

    public static IServiceCollection AddClientCors(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

        services.AddCors(options =>
            options.AddPolicy(ClientPolicy, policy =>
                policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()
            )
        );

        return services;
    }

    public static IApplicationBuilder UseClientCors(this IApplicationBuilder app) =>
        app.UseCors(ClientPolicy);
}
