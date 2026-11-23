using Server.Common;
using Server.Data;
using Server.Endpoints;
using Server.Extraction.Fetching;
using Server.Extraction.Parsing;
using Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options => JsonSettings.Apply(options.SerializerOptions));

builder.Services.AddClientCors(builder.Configuration);
builder.Services.AddOwnerAuthentication(builder.Configuration);
builder.Services.AddSingleton(TimeProvider.System);

// משרות
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddScoped<IApplicationService, ApplicationService>();

// מגייסים
builder.Services.AddScoped<IRecruiterService, RecruiterService>();

// חילוץ פרטי משרה מקישור
builder
    .Services.AddHttpClient<IPageFetcher, HttpPageFetcher>(client =>
    {
        client.Timeout = TimeSpan.FromSeconds(10);
        client.DefaultRequestHeaders.UserAgent.ParseAdd(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
        );
        client.DefaultRequestHeaders.AcceptLanguage.ParseAdd("he,en;q=0.8");
    })
    .ConfigurePrimaryHttpMessageHandler(PublicNetworkHandler.Create);

// הסדר קובע: שכבה מוקדמת גוברת על שכבות שאחריה
builder.Services.AddSingleton<IJobPageExtractor, JsonLdJobPostingExtractor>();
builder.Services.AddSingleton<IJobPageExtractor, OpenGraphExtractor>();
builder.Services.AddSingleton<IJobPageExtractor, PageTitleExtractor>();
builder.Services.AddScoped<IJobExtractionService, JobExtractionService>();

// בדיקת חיים לפינג החיצוני שמשאיר את השרת ער
builder.Services.AddHealthChecks();

var app = builder.Build();

await app.PrepareDatabaseAsync();

app.UseClientCors();

// קובצי JavaScript ו־CSS של האתר מוגשים גם בלי התחברות: אין בהם נתונים.
// אין כאן UseDefaultFiles: הכתובת "/" מגיעה ל־MapFallbackToFile שלמטה, ושם היא מוגנת.
app.UseStaticFiles();

// מי המשתמש (מהעוגייה), ומה מותר לו. מכאן והלאה כל נתיב דורש התחברות, חוץ מ־/auth
app.UseAuthentication();
app.UseAuthorization();

// פתוח בלי התחברות, ומחזיר רק "Healthy". הוא בכוונה לא פונה למסד:
// פינג כל כמה דקות היה מונע מהמסד ב־Neon להירדם, ומכלה את שעות העיבוד החינמיות
app.MapHealthChecks("/health").AllowAnonymous();

app.MapAuthEndpoints();
app.MapApplicationEndpoints();
app.MapRecruiterEndpoints();
app.MapJobExtractionEndpoints();

// כתובת /api שלא קיימת מחזירה 404, ולא את דף האתר
app.MapFallback("/api/{**path}", () => Results.NotFound());

// כל כתובת אחרת מחזירה את האתר, ו־Angular מחליט מה להציג
app.MapFallbackToFile("index.html");

app.Run();
