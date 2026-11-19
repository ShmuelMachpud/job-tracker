using AngleSharp.Dom;

namespace Server.Extraction.Parsing;

/// <summary>מוצא אחרון: הכותרת של הדף, מה שמופיע בלשונית של הדפדפן.</summary>
public class PageTitleExtractor : IJobPageExtractor
{
    public ExtractedFields Extract(IDocument document) =>
        ExtractedFields.Empty with { Role = TextCleaner.FirstTitleSegment(document.Title) };
}
