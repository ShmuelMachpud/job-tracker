using Server.Common;
using Server.Data;
using Server.Endpoints;
using Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options => JsonSettings.Apply(options.SerializerOptions));

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<IApplicationRepository, JsonFileApplicationRepository>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();

var app = builder.Build();

app.MapApplicationEndpoints();

app.Run();
