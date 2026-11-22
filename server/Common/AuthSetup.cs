using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;

namespace Server.Common;

/// <summary>
/// התחברות עם Google, ורק למייל אחד מורשה (Auth:AllowedEmail).
/// אחרי ההתחברות השרת שומר עוגייה מוצפנת, והדפדפן שולח אותה בכל בקשה.
/// </summary>
public static class AuthSetup
{
    public static IServiceCollection AddOwnerAuthentication(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        var clientId = Required(configuration, "Authentication:Google:ClientId");
        var clientSecret = Required(configuration, "Authentication:Google:ClientSecret");
        var allowedEmail = Required(configuration, "Auth:AllowedEmail");

        bool IsAllowed(ClaimsPrincipal? user) =>
            string.Equals(
                user?.FindFirstValue(ClaimTypes.Email),
                allowedEmail,
                StringComparison.OrdinalIgnoreCase
            );

        services
            .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.Name = "jobtracker.auth";
                options.Cookie.HttpOnly = true; // JavaScript לא יכול לקרוא אותה
                options.Cookie.SameSite = SameSiteMode.Lax; // אתרים אחרים לא יכולים לשלוח בשמך בקשות שמשנות נתונים
                options.ExpireTimeSpan = TimeSpan.FromDays(30);
                options.SlidingExpiration = true; // כל שימוש מאריך את התוקף
                options.LoginPath = "/auth/login";
                options.AccessDeniedPath = "/auth/denied";
                options.Events.OnRedirectToLogin = context =>
                    RedirectOrStatus(context, StatusCodes.Status401Unauthorized);
                options.Events.OnRedirectToAccessDenied = context =>
                    RedirectOrStatus(context, StatusCodes.Status403Forbidden);
            })
            .AddGoogle(options =>
            {
                options.ClientId = clientId;
                options.ClientSecret = clientSecret;

                // מייל אחר לא מקבל עוגייה בכלל: עוצרים כבר כש־Google מחזיר את המשתמש
                options.Events.OnTicketReceived = context =>
                {
                    if (!IsAllowed(context.Principal))
                    {
                        context.Response.Redirect("/auth/denied");
                        context.HandleResponse();
                    }
                    return Task.CompletedTask;
                };
            });

        // גם אם מישהו יקבל עוגייה, כל בקשה בודקת שוב שזה המייל המורשה
        var ownerOnly = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .RequireAssertion(context => IsAllowed(context.User))
            .Build();

        // FallbackPolicy חל על כל נתיב שלא סומן אחרת, כך ששום נתיב חדש לא יישאר פתוח בטעות
        services.AddAuthorizationBuilder().SetFallbackPolicy(ownerOnly);

        return services;
    }

    /// <summary>
    /// דף באתר מועבר לדף ההתחברות. בקשה ל־API מקבלת קוד מצב (401 או 403),
    /// כי מעבר ל־Google באמצע בקשת fetch לא עובד, והאתר מטפל בזה בעצמו.
    /// </summary>
    private static Task RedirectOrStatus(
        RedirectContext<CookieAuthenticationOptions> context,
        int apiStatusCode
    )
    {
        if (context.Request.Path.StartsWithSegments("/api"))
            context.Response.StatusCode = apiStatusCode;
        else
            context.Response.Redirect(context.RedirectUri);

        return Task.CompletedTask;
    }

    private static string Required(IConfiguration configuration, string key) =>
        configuration[key] is { Length: > 0 } value
            ? value
            : throw new InvalidOperationException(
                $"חסרה ההגדרה {key}. במחשב: dotnet user-secrets. בענן: משתנה סביבה."
            );
}
