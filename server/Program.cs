using Server.Common;
using Server.Data;
using Server.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options => JsonSettings.Apply(options.SerializerOptions));
builder.Services.AddSingleton<IApplicationRepository, JsonFileApplicationRepository>();

var app = builder.Build();

app.MapApplicationEndpoints();

app.Run();