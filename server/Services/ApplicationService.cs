using Server.Common;
using Server.Contracts;
using Server.Data;
using Server.Models;

namespace Server.Services;

public class ApplicationService : IApplicationService
{
    private readonly IApplicationRepository _repository;
    private readonly IRecruiterRepository _recruiters;
    private readonly TimeProvider _time;

    public ApplicationService(
        IApplicationRepository repository,
        IRecruiterRepository recruiters,
        TimeProvider time
    )
    {
        _repository = repository;
        _recruiters = recruiters;
        _time = time;
    }

    public Task<IReadOnlyList<JobApplication>> GetAllAsync() => _repository.GetAllAsync();

    public Task<JobApplication?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

    public async Task<Result<JobApplication>> CreateAsync(CreateApplicationRequest request)
    {
        if (request.Details is not { } details)
        {
            return Result<JobApplication>.Invalid(
                new Dictionary<string, string[]> { ["details"] = ["חסרים פרטי המשרה"] }
            );
        }

        var errors = await ValidateAsync(details);
        if (errors.Count > 0)
            return Result<JobApplication>.Invalid(errors);

        var now = _time.GetUtcNow();
        // בלי סטטוס בבקשה, משרה חדשה מתחילה כ"הוגש", כמו קודם
        var status = request.Status ?? ApplicationStatus.Applied;

        var application = new JobApplication
        {
            Id = Guid.NewGuid(),
            Company = details.Company!.Trim(),
            Role = details.Role!.Trim(),
            AppliedAt = details.AppliedAt ?? DateOnly.FromDateTime(_time.GetLocalNow().DateTime),
            Source = Clean(details.Source),
            Url = Clean(details.Url),
            Contact = Clean(details.Contact),
            RecruiterId = details.RecruiterId,
            Salary = Clean(details.Salary),
            NextAction = Clean(details.NextAction),
            NextActionAt = details.NextActionAt,
            Notes = Clean(details.Notes),
            Status = status,
            History = [new StatusChange(status, now)],
            CreatedAt = now,
            UpdatedAt = now,
        };

        await _repository.AddAsync(application);
        return Result<JobApplication>.Success(application);
    }

    public async Task<Result<JobApplication>> UpdateAsync(
        Guid id,
        ApplicationDetailsRequest request
    )
    {
        var errors = await ValidateAsync(request);
        if (errors.Count > 0)
            return Result<JobApplication>.Invalid(errors);

        var existing = await _repository.GetByIdAsync(id);
        if (existing is null)
            return Result<JobApplication>.NotFound();

        var updated = existing with
        {
            Company = request.Company!.Trim(),
            Role = request.Role!.Trim(),
            AppliedAt = request.AppliedAt ?? existing.AppliedAt,
            Source = Clean(request.Source),
            Url = Clean(request.Url),
            Contact = Clean(request.Contact),
            RecruiterId = request.RecruiterId,
            Salary = Clean(request.Salary),
            NextAction = Clean(request.NextAction),
            NextActionAt = request.NextActionAt,
            Notes = Clean(request.Notes),
            UpdatedAt = _time.GetUtcNow(),
        };

        return await SaveAsync(updated);
    }

    public async Task<Result<JobApplication>> ChangeStatusAsync(
        Guid id,
        ChangeStatusRequest request
    )
    {
        if (request.Status is not { } newStatus)
        {
            return Result<JobApplication>.Invalid(
                new Dictionary<string, string[]> { ["status"] = ["חובה לבחור סטטוס"] }
            );
        }

        var existing = await _repository.GetByIdAsync(id);
        if (existing is null)
            return Result<JobApplication>.NotFound();

        // אותו סטטוס: אין שינוי, ולא רושמים היסטוריה כפולה
        if (existing.Status == newStatus)
            return Result<JobApplication>.Success(existing);

        var now = _time.GetUtcNow();
        var updated = existing with
        {
            Status = newStatus,
            History = [.. existing.History, new StatusChange(newStatus, now)],
            UpdatedAt = now,
        };

        return await SaveAsync(updated);
    }

    public Task<bool> DeleteAsync(Guid id) => _repository.DeleteAsync(id);

    private async Task<Result<JobApplication>> SaveAsync(JobApplication application)
    {
        var saved = await _repository.UpdateAsync(application);
        return saved
            ? Result<JobApplication>.Success(application)
            : Result<JobApplication>.NotFound();
    }

    private async Task<Dictionary<string, string[]>> ValidateAsync(
        ApplicationDetailsRequest request
    )
    {
        var errors = new Dictionary<string, string[]>();

        ValidateName(errors, "company", request.Company, "חברה");
        ValidateName(errors, "role", request.Role, "תפקיד");

        if (request.RecruiterId is { } recruiterId && !await _recruiters.ExistsAsync(recruiterId))
            errors["recruiterId"] = ["המגייס לא נמצא. ייתכן שנמחק"];

        return errors;
    }

    private static void ValidateName(
        Dictionary<string, string[]> errors,
        string field,
        string? value,
        string label
    )
    {
        if (string.IsNullOrWhiteSpace(value))
            errors[field] = [$"חובה למלא {label}"];
        else if (value.Trim().Length > JobApplication.MaxNameLength)
            errors[field] = [$"השדה {label} ארוך מדי, עד {JobApplication.MaxNameLength} תווים"];
    }

    // מחרוזת ריקה או רק רווחים נשמרת כ־null, ומסירים רווחים מהקצוות
    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
