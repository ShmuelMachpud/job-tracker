using System.Net;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Server.Common;
using Server.Contracts;

namespace Server.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        // דפי ההתחברות חייבים להיות פתוחים, אחרת אי אפשר להגיע אליהם כדי להתחבר
        var auth = app.MapGroup("/auth").AllowAnonymous();
        auth.MapGet("/login", Login);
        auth.MapPost("/logout", Logout);
        auth.MapGet("/denied", Denied);

        // מוגן כמו כל ה־API
        app.MapGet("/api/me", Me);
    }

    /// <summary>שולח את המשתמש ל־Google. אחרי ההתחברות הוא חוזר ל־returnUrl.</summary>
    private static IResult Login(string? returnUrl, IConfiguration configuration) =>
        Results.Challenge(
            new AuthenticationProperties { RedirectUri = SafeReturnUrl(returnUrl, configuration) },
            [GoogleDefaults.AuthenticationScheme]
        );

    /// <summary>
    /// מוחק את העוגייה ומציג דף "התנתקת". לא חוזרים ישר לאתר, כי האתר היה שולח שוב ל־Google,
    /// ו־Google, שעדיין זוכר אותך, היה מחבר אותך מחדש מיד.
    /// </summary>
    private static async Task<IResult> Logout(
        HttpContext context,
        string? returnUrl,
        IConfiguration configuration
    )
    {
        await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Page(
            "התנתקת",
            "יצאת מהחשבון בהצלחה.",
            LoginLink(SafeReturnUrl(returnUrl, configuration), "התחברות מחדש"),
            StatusCodes.Status200OK
        );
    }

    private static IResult Denied() =>
        Page(
            "אין גישה",
            "החשבון הזה לא מורשה להיכנס לאתר.",
            LoginLink("/", "התחברות עם חשבון אחר"),
            StatusCodes.Status403Forbidden
        );

    private static IResult Me(ClaimsPrincipal user) =>
        Results.Ok(
            new CurrentUserResponse(
                user.FindFirstValue(ClaimTypes.Email)!,
                user.FindFirstValue(ClaimTypes.Name)
            )
        );

    /// <summary>
    /// מחזירים רק לכתובת באתר שלנו, או לאתר מהרשימה של CORS (בפיתוח: פורט 4200).
    /// בלי הבדיקה, קישור כמו /auth/login?returnUrl=https://אתר-מתחזה היה מעביר לשם אחרי ההתחברות.
    /// </summary>
    private static string SafeReturnUrl(string? returnUrl, IConfiguration configuration)
    {
        if (string.IsNullOrEmpty(returnUrl))
            return "/";

        // כתובת יחסית באותו אתר. "//" ו־"/\" הם בפועל כתובות של אתר אחר
        if (returnUrl.StartsWith('/') && !returnUrl.StartsWith("//") && !returnUrl.StartsWith("/\\"))
            return returnUrl;

        var isAllowedOrigin =
            Uri.TryCreate(returnUrl, UriKind.Absolute, out var url)
            && CorsSetup
                .AllowedOrigins(configuration)
                .Contains(url.GetLeftPart(UriPartial.Authority), StringComparer.OrdinalIgnoreCase);

        return isAllowedOrigin ? returnUrl : "/";
    }

    private static string LoginLink(string returnUrl, string text) =>
        $"<a href=\"/auth/login?returnUrl={WebUtility.UrlEncode(returnUrl)}\">{text}</a>";

    /// <summary>דף HTML קטן ופשוט, לדפים שמוצגים לפני שהאתר עצמו נטען.</summary>
    private static IResult Page(string title, string message, string actionHtml, int statusCode) =>
        Results.Content(
            $$"""
            <!doctype html>
            <html lang="he" dir="rtl">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>{{title}} · JobTracker</title>
              <style>
                body { margin: 0; min-height: 100vh; display: grid; place-items: center;
                       font-family: system-ui, sans-serif; background: #edf3fc; color: #1b1b1f; }
                main { background: #fff; border: 1px solid #c4c6d0; border-radius: 16px;
                       padding: 32px; max-width: 360px; text-align: center; }
                h1 { margin: 0 0 8px; font-size: 1.5rem; }
                p { margin: 0 0 20px; color: #44474e; }
                a { display: inline-block; padding: 10px 20px; border-radius: 999px;
                    background: #1a5fd0; color: #fff; text-decoration: none; }
              </style>
            </head>
            <body>
              <main>
                <h1>{{title}}</h1>
                <p>{{message}}</p>
                {{actionHtml}}
              </main>
            </body>
            </html>
            """,
            "text/html; charset=utf-8",
            statusCode: statusCode
        );
}
