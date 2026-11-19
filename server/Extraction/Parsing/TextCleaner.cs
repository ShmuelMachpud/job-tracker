using System.Net;
using System.Text.RegularExpressions;

namespace Server.Extraction.Parsing;

public static partial class TextCleaner
{
    private static readonly string[] TitleSeparators = [" | ", " – ", " — "];

    /// <summary>מפענח ישויות HTML, מכווץ רווחים ומחזיר null לטקסט ריק.</summary>
    public static string? Clean(string? value)
    {
        if (value is null)
            return null;

        var cleaned = Whitespace().Replace(WebUtility.HtmlDecode(value), " ").Trim();
        return cleaned.Length == 0 ? null : cleaned;
    }

    /// <summary>
    /// כותרות של דפים הן לרוב "תפקיד | חברה" או "תפקיד – אתר". לוקחים את החלק הראשון.
    /// מפרידים רק לפי | ו־– עם רווחים, ולא לפי מקף רגיל, כי הוא מופיע בשמות תפקידים כמו Front-End.
    /// </summary>
    public static string? FirstTitleSegment(string? title)
    {
        var cleaned = Clean(title);
        if (cleaned is null)
            return null;

        var first = cleaned.Split(TitleSeparators, StringSplitOptions.None)[0];
        return Clean(first);
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex Whitespace();
}
