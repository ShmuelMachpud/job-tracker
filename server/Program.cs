using System.Text.Json;
using System.Text.Json.Serialization;
using Server.Models;

var builder = WebApplication.CreateBuilder(args);

// הסטטוס יישלח כטקסט ("applied") ולא כמספר (0)
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});

var app = builder.Build();

app.MapGet("/api/applications", () =>
{
    var sample = new List<JobApplication>
    {
        new()
        {
            Id = Guid.NewGuid(),
            Company = "חברה לדוגמה",
            Role = "מפתח Full Stack",
            AppliedAt = DateOnly.FromDateTime(DateTime.Today),
            Source = "לינקדאין",
            Status = ApplicationStatus.Applied
        }
    };
    return sample;
});

app.Run();