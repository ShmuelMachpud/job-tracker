namespace Server.Models;

/// <summary>מי שאני בקשר איתו בחיפוש העבודה: מגייס בחברה, חברת השמה, או חבר שמפנה.</summary>
public record Recruiter
{
    public const int MaxNameLength = 200;
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public RecruiterKind Kind { get; init; }
    public string? Company { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? LinkedIn { get; init; }
    public string? Notes { get; init; }
    public DateOnly? LastContactAt { get; init; }
    public string? NextAction { get; init; }
    public DateOnly? NextActionAt { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}
