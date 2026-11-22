namespace Server.Contracts;

/// <summary>המשתמש המחובר, כדי שהאתר יוכל להציג מי מחובר.</summary>
public record CurrentUserResponse(string Email, string? Name);
