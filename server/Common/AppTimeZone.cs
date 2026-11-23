namespace Server.Common;

/// <summary>
/// אזור הזמן של המשתמש. השרת בענן רץ לפי UTC, אבל "היום" ו"שעה 09:30" הם לפי שעון ישראל.
/// </summary>
public static class AppTimeZone
{
    public static readonly TimeZoneInfo Zone = Find();

    public static DateOnly Today(TimeProvider time) =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(time.GetUtcNow(), Zone).DateTime);

    public static DateOnly DateOf(DateTimeOffset moment) =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(moment, Zone).DateTime);

    /// <summary>תאריך ושעה לפי שעון ישראל, כרגע מוחלט בזמן.</summary>
    public static DateTimeOffset At(DateOnly date, TimeOnly time)
    {
        var local = date.ToDateTime(time);
        return new DateTimeOffset(local, Zone.GetUtcOffset(local));
    }

    private static TimeZoneInfo Find()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Asia/Jerusalem");
        }
        catch (TimeZoneNotFoundException)
        {
            // בלי נתוני אזורי זמן במערכת, עדיף אזור הזמן של המחשב מאשר לקרוס
            return TimeZoneInfo.Local;
        }
    }
}
