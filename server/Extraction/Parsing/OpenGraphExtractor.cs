using AngleSharp.Dom;

namespace Server.Extraction.Parsing;

/// <summary>
/// תגיות Open Graph, שכמעט כל אתר כולל בשביל התצוגה המקדימה ברשתות ובוואטסאפ.
/// פחות מדויקות מ־JSON-LD: הכותרת היא לרוב שורה אחת כמו "Angular Developer at Wix".
/// </summary>
public class OpenGraphExtractor : IJobPageExtractor
{
    public ExtractedFields Extract(IDocument document) =>
        new(
            Company: null,
            Role: TextCleaner.FirstTitleSegment(Meta(document, "og:title")),
            Salary: null,
            SiteName: TextCleaner.Clean(Meta(document, "og:site_name"))
        );

    private static string? Meta(IDocument document, string property) =>
        document.QuerySelector($"meta[property='{property}']")?.GetAttribute("content");
}
