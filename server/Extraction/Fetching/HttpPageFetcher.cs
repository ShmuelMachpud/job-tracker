using System.Text;

namespace Server.Extraction.Fetching;

/// <summary>
/// מביא דף HTML דרך HttpClient שמוגדר ב־Program.cs עם PublicNetworkHandler ועם זמן המתנה מוגבל.
/// </summary>
public class HttpPageFetcher : IPageFetcher
{
    private const int MaxBytes = 2 * 1024 * 1024;

    private readonly HttpClient _http;
    private readonly ILogger<HttpPageFetcher> _logger;

    public HttpPageFetcher(HttpClient http, ILogger<HttpPageFetcher> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<FetchedPage?> FetchAsync(Uri url, CancellationToken cancellationToken)
    {
        try
        {
            using var response = await _http.GetAsync(
                url,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken
            );

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Page fetch returned {Status} for {Host}", response.StatusCode, url.Host);
                return null;
            }

            var mediaType = response.Content.Headers.ContentType?.MediaType;
            if (mediaType is not null && !mediaType.Contains("html", StringComparison.OrdinalIgnoreCase))
                return null;

            var html = await ReadLimitedAsync(response.Content, cancellationToken);
            var finalUrl = response.RequestMessage?.RequestUri ?? url;
            return new FetchedPage(finalUrl, html);
        }
        catch (HttpRequestException exception)
        {
            _logger.LogInformation("Page fetch failed for {Host}: {Message}", url.Host, exception.Message);
            return null;
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            // זמן ההמתנה של HttpClient נגמר, לא ביטול של הבקשה עצמה
            _logger.LogInformation("Page fetch timed out for {Host}", url.Host);
            return null;
        }
    }

    /// <summary>קורא עד MaxBytes. דף גדול יותר נחתך, וזה בסדר: הפרטים שמחפשים נמצאים בראש הדף.</summary>
    private static async Task<string> ReadLimitedAsync(HttpContent content, CancellationToken cancellationToken)
    {
        await using var stream = await content.ReadAsStreamAsync(cancellationToken);
        using var buffer = new MemoryStream();

        var chunk = new byte[16 * 1024];
        int read;
        while (buffer.Length < MaxBytes && (read = await stream.ReadAsync(chunk, cancellationToken)) > 0)
            buffer.Write(chunk, 0, (int)Math.Min(read, MaxBytes - buffer.Length));

        return EncodingFor(content).GetString(buffer.GetBuffer(), 0, (int)buffer.Length);
    }

    private static Encoding EncodingFor(HttpContent content)
    {
        var charset = content.Headers.ContentType?.CharSet?.Trim('"');
        if (string.IsNullOrEmpty(charset))
            return Encoding.UTF8;

        try
        {
            return Encoding.GetEncoding(charset);
        }
        catch (ArgumentException)
        {
            return Encoding.UTF8;
        }
    }
}
