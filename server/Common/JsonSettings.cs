using System.Text.Json;
using System.Text.Json.Serialization;

namespace Server.Common;

public static class JsonSettings
{
    public static void Apply(JsonSerializerOptions options)
    {
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    }
}
