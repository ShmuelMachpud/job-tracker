using Server.Models;

namespace Server.Data;

public interface IInteractionRepository
{
    Task<IReadOnlyList<Interaction>> GetAllAsync();
    Task<Interaction?> GetByIdAsync(Guid id);

    /// <summary>שומר את הרשומה ואת המגייס המעודכן יחד, כך ששניהם נשמרים או שאף אחד לא.</summary>
    Task AddAsync(Interaction interaction, Recruiter recruiter);

    Task<bool> UpdateAsync(Interaction interaction, Recruiter recruiter);
    Task<bool> DeleteAsync(Guid id);
}
