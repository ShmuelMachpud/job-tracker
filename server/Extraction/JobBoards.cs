namespace Server.Extraction;

/// <summary>
/// אתרי משרות ומערכות גיוס מוכרים. בהם שם האתר הוא המקור ולא החברה:
/// משרה של Wix שמפורסמת ב־Comeet היא משרה של Wix, שמקורה Comeet.
/// </summary>
public static class JobBoards
{
    private static readonly (string Domain, string Name)[] Known =
    [
        ("linkedin.com", "LinkedIn"),
        ("comeet.com", "Comeet"),
        ("comeet.co", "Comeet"),
        ("greenhouse.io", "Greenhouse"),
        ("lever.co", "Lever"),
        ("ashbyhq.com", "Ashby"),
        ("smartrecruiters.com", "SmartRecruiters"),
        ("workable.com", "Workable"),
        ("myworkdayjobs.com", "Workday"),
        ("indeed.com", "Indeed"),
        ("glassdoor.com", "Glassdoor"),
        ("alljobs.co.il", "AllJobs"),
        ("drushim.co.il", "דרושים"),
        ("jobmaster.co.il", "JobMaster"),
    ];

    /// <summary>שם האתר אם הוא אתר משרות מוכר, אחרת null.</summary>
    public static string? NameFor(string host)
    {
        host = host.ToLowerInvariant();
        foreach (var (domain, name) in Known)
        {
            if (host == domain || host.EndsWith("." + domain, StringComparison.Ordinal))
                return name;
        }

        return null;
    }
}
