using AngleSharp.Dom;

namespace Server.Extraction.Parsing;

/// <summary>
/// שכבת חילוץ אחת. השכבות רשומות ב־Program.cs לפי סדר האמינות שלהן:
/// מה שהשכבה הראשונה מצאה גובר על מה שהשכבות שאחריה מצאו.
/// </summary>
public interface IJobPageExtractor
{
    ExtractedFields Extract(IDocument document);
}
