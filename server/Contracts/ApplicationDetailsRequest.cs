namespace Server.Contracts;

public record ApplicationDetailsRequest(
    string? Company,
    string? Role,
    DateOnly? AppliedAt,
    TimeOnly? AppliedTime,
    string? Source,
    string? Url,
    string? Contact,
    string? Salary,
    string? NextAction,
    DateOnly? NextActionAt,
    string? Notes,
    Guid? RecruiterId
);
