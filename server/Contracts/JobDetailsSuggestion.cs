namespace Server.Contracts;

/// <summary>
/// הצעה למילוי הטופס, מתוך דף המשרה. היא לא נשמרת: המשתמש רואה אותה בטופס, מתקן ושומר.
/// כל שדה יכול להיות null כשלא נמצא בדף.
/// </summary>
public record JobDetailsSuggestion(
    string? Company,
    string? Role,
    string? Source,
    string? Salary,
    string? Notes,
    string Url
);
