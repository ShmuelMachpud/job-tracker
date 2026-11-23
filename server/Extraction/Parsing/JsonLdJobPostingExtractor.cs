using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using AngleSharp.Dom;

namespace Server.Extraction.Parsing;

/// <summary>
/// השכבה המדויקת ביותר: נתונים מובנים מסוג JobPosting (schema.org) שאתרי משרות מטמיעים בדף בשביל Google.
/// https://schema.org/JobPosting
/// </summary>
public class JsonLdJobPostingExtractor : IJobPageExtractor
{
    public ExtractedFields Extract(IDocument document)
    {
        foreach (var script in document.QuerySelectorAll("script[type='application/ld+json']"))
        {
            var posting = FindJobPostings(Parse(script.TextContent)).FirstOrDefault();
            if (posting is not null)
                return Map(posting);
        }

        return ExtractedFields.Empty;
    }

    private static JsonNode? Parse(string json)
    {
        try
        {
            return JsonNode.Parse(json);
        }
        catch (JsonException)
        {
            // JSON שבור באתר כלשהו לא אמור להפיל את החילוץ כולו
            return null;
        }
    }

    /// <summary>JobPosting יכול להופיע לבד, בתוך מערך, או בתוך @graph.</summary>
    private static IEnumerable<JsonObject> FindJobPostings(JsonNode? node)
    {
        switch (node)
        {
            case JsonArray array:
                foreach (var item in array)
                foreach (var posting in FindJobPostings(item))
                    yield return posting;
                break;

            case JsonObject obj:
                if (IsJobPosting(obj["@type"]))
                    yield return obj;
                foreach (var posting in FindJobPostings(obj["@graph"]))
                    yield return posting;
                break;
        }
    }

    private static bool IsJobPosting(JsonNode? type) =>
        type switch
        {
            JsonValue value => Text(value) == "JobPosting",
            JsonArray values => values.Any(v => Text(v) == "JobPosting"),
            _ => false,
        };

    private static ExtractedFields Map(JsonObject posting) =>
        new(
            Company: posting["hiringOrganization"] switch
            {
                JsonObject organization => Text(organization["name"]),
                var other => Text(other),
            },
            Role: Text(posting["title"]),
            Salary: FormatSalary(posting["baseSalary"]),
            SiteName: null
        )
        {
            Location = FormatLocation(posting),
            EmploymentType = FormatEmploymentType(posting["employmentType"]),
            DatePosted = ParseDate(Text(posting["datePosted"])),
        };

    /// <summary>
    /// הערים מ־jobLocation, למשל "ירושלים" או "תל אביב, חיפה". משרה מהבית מסומנת ב־jobLocationType.
    /// jobLocation ו־address יכולים להיות אובייקט, מערך או טקסט.
    /// </summary>
    private static string? FormatLocation(JsonObject posting)
    {
        var places = Items(posting["jobLocation"])
            .SelectMany(place => place is JsonObject obj ? Items(obj["address"]) : [place])
            .Select(address =>
                address is JsonObject obj
                    ? Text(obj["addressLocality"]) ?? Text(obj["addressRegion"])
                    : Text(address)
            )
            .OfType<string>()
            .ToList();

        if (Items(posting["jobLocationType"]).Any(type => Text(type) == "TELECOMMUTE"))
            places.Add("מרחוק");

        var distinct = places.Distinct().ToList();
        return distinct.Count == 0 ? null : string.Join(", ", distinct);
    }

    private static string? FormatEmploymentType(JsonNode? employmentType)
    {
        var labels = Items(employmentType)
            .Select(type => EmploymentTypeLabel(Text(type)))
            .OfType<string>()
            .Distinct()
            .ToList();

        return labels.Count == 0 ? null : string.Join(", ", labels);
    }

    private static string? EmploymentTypeLabel(string? type) =>
        type?.ToUpperInvariant().Replace('-', '_') switch
        {
            "FULL_TIME" => "משרה מלאה",
            "PART_TIME" => "משרה חלקית",
            "CONTRACTOR" => "פרילנס",
            "TEMPORARY" => "זמנית",
            "INTERN" => "התמחות",
            _ => null,
        };

    /// <summary>"2026-11-19" או "2026-11-19T15:43": רק התאריך.</summary>
    private static DateOnly? ParseDate(string? value) =>
        value is { Length: >= 10 }
        && DateOnly.TryParseExact(
            value[..10],
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var date
        )
            ? date
            : null;

    /// <summary>ערך בודד או מערך, כרשימה.</summary>
    private static IEnumerable<JsonNode> Items(JsonNode? node) =>
        node switch
        {
            null => [],
            JsonArray array => array.OfType<JsonNode>(),
            _ => [node],
        };

    /// <summary>למשל "20,000-25,000 ILS לחודש".</summary>
    private static string? FormatSalary(JsonNode? baseSalary)
    {
        if (baseSalary is not JsonObject salary)
            return null;

        var currency = Text(salary["currency"]);
        var (amount, unit) = salary["value"] switch
        {
            JsonObject value => (FormatRange(value), Text(value["unitText"])),
            var value => (FormatNumber(value), (string?)null),
        };

        if (amount is null)
            return null;

        var parts = new[] { amount, currency, UnitLabel(unit) };
        return string.Join(" ", parts.Where(part => part is not null));
    }

    private static string? FormatRange(JsonObject value)
    {
        var min = FormatNumber(value["minValue"]);
        var max = FormatNumber(value["maxValue"]);

        return (min, max) switch
        {
            (not null, not null) when min != max => $"{min}-{max}",
            (not null, _) => min,
            (_, not null) => max,
            _ => FormatNumber(value["value"]),
        };
    }

    private static string? FormatNumber(JsonNode? node)
    {
        if (node is not JsonValue value)
            return null;

        if (value.TryGetValue<decimal>(out var number))
            return number.ToString("N0", CultureInfo.InvariantCulture);

        return decimal.TryParse(
            Text(value),
            NumberStyles.Any,
            CultureInfo.InvariantCulture,
            out number
        )
            ? number.ToString("N0", CultureInfo.InvariantCulture)
            : null;
    }

    private static string? UnitLabel(string? unit) =>
        unit?.ToUpperInvariant() switch
        {
            "YEAR" => "לשנה",
            "MONTH" => "לחודש",
            "HOUR" => "לשעה",
            _ => null,
        };

    private static string? Text(JsonNode? node) =>
        node is JsonValue value && value.TryGetValue<string>(out var text)
            ? TextCleaner.Clean(text)
            : null;
}
