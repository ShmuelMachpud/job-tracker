using Server.Models;

namespace Server.Contracts;

/// <summary>מה שהאתר שולח ביצירה ובעדכון של מגייס.</summary>
public record RecruiterRequest(
    string? Name,
    RecruiterKind? Kind,
    string? Company,
    string? Phone,
    string? Email,
    string? LinkedIn,
    string? Notes,
    DateOnly? LastContactAt,
    string? NextAction,
    DateOnly? NextActionAt
);
