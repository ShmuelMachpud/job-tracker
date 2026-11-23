using Server.Models;

namespace Server.Contracts;

/// <summary>הרשומה שנשמרה, והמגייס אחרי העדכון (קשר אחרון, פעולה הבאה).</summary>
public record InteractionResponse(Interaction Interaction, Recruiter Recruiter);
