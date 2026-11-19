namespace Server.Extraction.Parsing;

/// <summary>
/// מה שכבת חילוץ אחת מצאה בדף. כל שדה יכול להיות null.
/// SiteName הוא שם האתר (למשל "Wix Careers" או "Comeet"), והשירות מחליט אם זו החברה או המקור.
/// </summary>
public record ExtractedFields(string? Company, string? Role, string? Salary, string? SiteName)
{
    public static readonly ExtractedFields Empty = new(null, null, null, null);

    /// <summary>משלים שדות חסרים משכבה אחרת. מה שכבר נמצא לא נדרס.</summary>
    public ExtractedFields OrElse(ExtractedFields fallback) =>
        new(
            Company ?? fallback.Company,
            Role ?? fallback.Role,
            Salary ?? fallback.Salary,
            SiteName ?? fallback.SiteName
        );
}
