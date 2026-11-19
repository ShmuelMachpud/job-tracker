namespace Server.Contracts;

public record ApplicationDetailsRequest(
    string? Company,
    string? Role,
    DateOnly? AppliedAt,
    string? Source,
    string? Url,
    string? Contact,
    string? Salary,
    string? NextAction,
    DateOnly? NextActionAt,
    string? Notes
);
