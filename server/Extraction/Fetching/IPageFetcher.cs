namespace Server.Extraction.Fetching;

/// <summary>דף שהובא מהאינטרנט. FinalUrl הוא הכתובת אחרי הפניות.</summary>
public record FetchedPage(Uri FinalUrl, string Html);

public interface IPageFetcher
{
    /// <summary>מחזיר null כשלא הצלחנו להביא דף HTML תקין: שגיאה, זמן המתנה ארוך, או תוכן שאינו דף.</summary>
    Task<FetchedPage?> FetchAsync(Uri url, CancellationToken cancellationToken);
}
