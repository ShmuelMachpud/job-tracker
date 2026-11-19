namespace Server.Models;

public record JobApplication
{
    public Guid Id { get; init; }
    public required string Company { get; init; }
    public required string Role { get; init; }
    public DateOnly AppliedAt { get; init; }
    public string? Source { get; init; }
    public string? Url { get; init; }
    public string? Contact { get; init; }
    public string? Salary { get; init; }
    public string? NextAction { get; init; }
    public DateOnly? NextActionAt { get; init; }
    public string? Notes { get; init; }
    public ApplicationStatus Status { get; init; }
    public IReadOnlyList<StatusChange> History { get; init; } = [];
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}