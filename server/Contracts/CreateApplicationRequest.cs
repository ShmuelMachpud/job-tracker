using Server.Models;

namespace Server.Contracts;

/// <summary>
/// יצירת משרה: הפרטים שלה, ובאיזה סטטוס היא מתחילה.
/// בעדכון אין סטטוס, כי שינוי סטטוס עובר בנתיב נפרד ונרשם בהיסטוריה.
/// </summary>
public record CreateApplicationRequest(ApplicationDetailsRequest? Details, ApplicationStatus? Status);
