using Server.Models;

namespace Server.Contracts;

/// <summary>
/// יצירה ועדכון של רשומה ביומן.
/// NextAction: אם נשלח, מעדכן באותה שמירה גם את הפעולה הבאה של המגייס (ריק = לנקות).
/// </summary>
public record InteractionRequest(
    Guid? RecruiterId,
    Guid? ApplicationId,
    DateOnly? Date,
    InteractionChannel? Channel,
    InteractionDirection? Direction,
    string? Summary,
    NextActionUpdate? NextAction
);

public record NextActionUpdate(string? Action, DateOnly? At);
