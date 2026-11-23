namespace Server.Models;

/// <summary>רשומה ביומן הקשר עם מגייס: שיחה, מייל, הודעה או פגישה.</summary>
public record Interaction
{
    public const int MaxSummaryLength = 2000;
    public Guid Id { get; init; }
    public Guid RecruiterId { get; init; }

    /// <summary>המשרה שהאינטראקציה עסקה בה, אם יש כזו.</summary>
    public Guid? ApplicationId { get; init; }

    public DateOnly Date { get; init; }
    public InteractionChannel Channel { get; init; }
    public InteractionDirection Direction { get; init; }
    public required string Summary { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}
