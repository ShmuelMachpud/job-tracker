using Server.Common;
using Server.Contracts;
using Server.Data;
using Server.Models;

namespace Server.Services;

public class RecruiterService : IRecruiterService
{
    private readonly IRecruiterRepository _repository;
    private readonly TimeProvider _time;

    public RecruiterService(IRecruiterRepository repository, TimeProvider time)
    {
        _repository = repository;
        _time = time;
    }

    public Task<IReadOnlyList<Recruiter>> GetAllAsync() => _repository.GetAllAsync();

    public Task<Recruiter?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

    public async Task<Result<Recruiter>> CreateAsync(RecruiterRequest request)
    {
        var errors = Validate(request);
        if (errors.Count > 0)
            return Result<Recruiter>.Invalid(errors);

        var now = _time.GetUtcNow();
        var recruiter = Apply(
            new Recruiter
            {
                Id = Guid.NewGuid(),
                Name = "",
                CreatedAt = now,
            },
            request,
            now
        );

        await _repository.AddAsync(recruiter);
        return Result<Recruiter>.Success(recruiter);
    }

    public async Task<Result<Recruiter>> UpdateAsync(Guid id, RecruiterRequest request)
    {
        var errors = Validate(request);
        if (errors.Count > 0)
            return Result<Recruiter>.Invalid(errors);

        var existing = await _repository.GetByIdAsync(id);
        if (existing is null)
            return Result<Recruiter>.NotFound();

        var updated = Apply(existing, request, _time.GetUtcNow());
        return await _repository.UpdateAsync(updated)
            ? Result<Recruiter>.Success(updated)
            : Result<Recruiter>.NotFound();
    }

    public Task<bool> DeleteAsync(Guid id) => _repository.DeleteAsync(id);

    /// <summary>מעתיק את הבקשה (אחרי בדיקה) למגייס. ביצירה ובעדכון זה אותו דבר.</summary>
    private static Recruiter Apply(
        Recruiter recruiter,
        RecruiterRequest request,
        DateTimeOffset now
    ) =>
        recruiter with
        {
            Name = request.Name!.Trim(),
            Kind = request.Kind!.Value,
            Company = Clean(request.Company),
            Phone = Clean(request.Phone),
            Email = Clean(request.Email),
            LinkedIn = Clean(request.LinkedIn),
            Notes = Clean(request.Notes),
            LastContactAt = request.LastContactAt,
            NextAction = Clean(request.NextAction),
            NextActionAt = request.NextActionAt,
            UpdatedAt = now,
        };

    private static Dictionary<string, string[]> Validate(RecruiterRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Name))
            errors["name"] = ["חובה למלא שם"];
        else if (request.Name.Trim().Length > Recruiter.MaxNameLength)
            errors["name"] = [$"השם ארוך מדי, עד {Recruiter.MaxNameLength} תווים"];

        if (request.Kind is null)
            errors["kind"] = ["חובה לבחור סוג"];

        if (Clean(request.Email) is { } email && !email.Contains('@'))
            errors["email"] = ["כתובת מייל לא תקינה"];

        // האתר מציג את הקישור כלחיץ, ולכן רק http ו־https
        if (Clean(request.LinkedIn) is { } linkedIn && !IsWebUrl(linkedIn))
            errors["linkedIn"] = ["קישור לא תקין. צריך כתובת מלאה שמתחילה ב־https://"];

        return errors;
    }

    private static bool IsWebUrl(string value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var url)
        && (url.Scheme == Uri.UriSchemeHttps || url.Scheme == Uri.UriSchemeHttp);

    // מחרוזת ריקה או רק רווחים נשמרת כ־null, ומסירים רווחים מהקצוות
    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
