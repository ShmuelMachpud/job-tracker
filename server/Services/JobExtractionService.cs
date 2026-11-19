using AngleSharp.Html.Parser;
using Server.Common;
using Server.Contracts;
using Server.Extraction;
using Server.Extraction.Fetching;
using Server.Extraction.Parsing;

namespace Server.Services;

public class JobExtractionService : IJobExtractionService
{
    private readonly IPageFetcher _fetcher;
    private readonly IReadOnlyList<IJobPageExtractor> _extractors;

    public JobExtractionService(IPageFetcher fetcher, IEnumerable<IJobPageExtractor> extractors)
    {
        _fetcher = fetcher;
        _extractors = extractors.ToList();
    }

    public async Task<Result<JobDetailsSuggestion>> ExtractAsync(
        ExtractJobRequest request,
        CancellationToken cancellationToken
    )
    {
        if (ParseWebUrl(request.Url) is not { } url)
            return InvalidUrl("קישור לא תקין. צריך להדביק כתובת מלאה שמתחילה ב־https://");

        var page = await _fetcher.FetchAsync(url, cancellationToken);
        if (page is null)
            return InvalidUrl("לא הצלחנו לקרוא את הדף. אפשר למלא את הפרטים ידנית");

        var document = new HtmlParser().ParseDocument(page.Html);

        // כל שכבה משלימה רק את מה שהשכבות שלפניה לא מצאו
        var fields = _extractors.Aggregate(
            ExtractedFields.Empty,
            (found, extractor) => found.OrElse(extractor.Extract(document))
        );

        var board = JobBoards.NameFor(page.FinalUrl.Host);

        return Result<JobDetailsSuggestion>.Success(
            new JobDetailsSuggestion(
                // באתר משרות, שם האתר הוא לא החברה
                Company: fields.Company ?? (board is null ? fields.SiteName : null),
                Role: fields.Role,
                Source: board ?? fields.SiteName ?? HostName(page.FinalUrl),
                Salary: fields.Salary,
                Url: url.ToString()
            )
        );
    }

    /// <summary>רק קישורי http ו־https. כתובות כמו file:// נדחות.</summary>
    private static Uri? ParseWebUrl(string? value) =>
        Uri.TryCreate(value?.Trim(), UriKind.Absolute, out var url)
        && (url.Scheme == Uri.UriSchemeHttps || url.Scheme == Uri.UriSchemeHttp)
            ? url
            : null;

    private static string HostName(Uri url) =>
        url.Host.StartsWith("www.", StringComparison.OrdinalIgnoreCase) ? url.Host[4..] : url.Host;

    private static Result<JobDetailsSuggestion> InvalidUrl(string message) =>
        Result<JobDetailsSuggestion>.Invalid(new Dictionary<string, string[]> { ["url"] = [message] });
}
