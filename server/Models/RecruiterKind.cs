namespace Server.Models;

public enum RecruiterKind
{
    /// <summary>מגייס או מגייסת בתוך החברה המגייסת.</summary>
    Internal,

    /// <summary>חברת השמה.</summary>
    Agency,

    /// <summary>מכר שמפנה אותי למשרה.</summary>
    Referrer,
}
