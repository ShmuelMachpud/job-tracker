using Server.Common;
using Server.Contracts;
using Server.Data;
using Server.Models;

namespace Server.Services;

public class InteractionService : IInteractionService
{
    private readonly IInteractionRepository _repository;
    private readonly IRecruiterRepository _recruiters;
    private readonly IApplicationRepository _applications;
    private readonly TimeProvider _time;

    public InteractionService(
        IInteractionRepository repository,
        IRecruiterRepository recruiters,
        IApplicationRepository applications,
        TimeProvider time
    )
    {
        _repository = repository;
        _recruiters = recruiters;
        _applications = applications;
        _time = time;
    }

    public Task<IReadOnlyList<Interaction>> GetAllAsync() => _repository.GetAllAsync();

    public async Task<Result<InteractionResponse>> CreateAsync(InteractionRequest request)
    {
        var errors = await ValidateAsync(request);
        if (request.RecruiterId is null)
            errors["recruiterId"] = ["חובה לבחור מגייס"];
        if (errors.Count > 0)
            return Result<InteractionResponse>.Invalid(errors);

        var recruiter = await _recruiters.GetByIdAsync(request.RecruiterId!.Value);
        if (recruiter is null)
            return Invalid("recruiterId", "המגייס לא נמצא. ייתכן שנמחק");

        var now = _time.GetUtcNow();
        var interaction = Apply(
            new Interaction
            {
                Id = Guid.NewGuid(),
                RecruiterId = recruiter.Id,
                Summary = "",
                CreatedAt = now,
            },
            request,
            now
        );
        var updatedRecruiter = UpdateRecruiter(
            recruiter,
            interaction.Date,
            request.NextAction,
            now
        );

        await _repository.AddAsync(interaction, updatedRecruiter);
        return Result<InteractionResponse>.Success(new(interaction, updatedRecruiter));
    }

    /// <summary>המגייס של רשומה קיימת לא משתנה. RecruiterId בבקשה לא נבדק בעדכון.</summary>
    public async Task<Result<InteractionResponse>> UpdateAsync(Guid id, InteractionRequest request)
    {
        var errors = await ValidateAsync(request);
        if (errors.Count > 0)
            return Result<InteractionResponse>.Invalid(errors);

        var existing = await _repository.GetByIdAsync(id);
        if (existing is null)
            return Result<InteractionResponse>.NotFound();

        var recruiter = await _recruiters.GetByIdAsync(existing.RecruiterId);
        if (recruiter is null)
            return Result<InteractionResponse>.NotFound();

        var now = _time.GetUtcNow();
        var updated = Apply(existing, request, now);
        var updatedRecruiter = UpdateRecruiter(recruiter, updated.Date, request.NextAction, now);

        return await _repository.UpdateAsync(updated, updatedRecruiter)
            ? Result<InteractionResponse>.Success(new(updated, updatedRecruiter))
            : Result<InteractionResponse>.NotFound();
    }

    /// <summary>מחיקה לא מחזירה אחורה את "קשר אחרון": אולי הוא עודכן ידנית.</summary>
    public Task<bool> DeleteAsync(Guid id) => _repository.DeleteAsync(id);

    private Interaction Apply(
        Interaction interaction,
        InteractionRequest request,
        DateTimeOffset now
    ) =>
        interaction with
        {
            ApplicationId = request.ApplicationId,
            Date = request.Date ?? DateOnly.FromDateTime(_time.GetLocalNow().DateTime),
            Channel = request.Channel!.Value,
            Direction = request.Direction!.Value,
            Summary = request.Summary!.Trim(),
            UpdatedAt = now,
        };

    /// <summary>
    /// "קשר אחרון" מתקדם רק קדימה: רשומה עם תאריך ישן לא מחזירה אותו אחורה.
    /// הפעולה הבאה מתעדכנת רק כשהבקשה כוללת אותה.
    /// </summary>
    private static Recruiter UpdateRecruiter(
        Recruiter recruiter,
        DateOnly contactDate,
        NextActionUpdate? nextAction,
        DateTimeOffset now
    )
    {
        var lastContact =
            recruiter.LastContactAt is { } current && current >= contactDate
                ? current
                : contactDate;

        return recruiter with
        {
            LastContactAt = lastContact,
            NextAction = nextAction is null ? recruiter.NextAction : Clean(nextAction.Action),
            NextActionAt = nextAction is null ? recruiter.NextActionAt : nextAction.At,
            UpdatedAt = now,
        };
    }

    private async Task<Dictionary<string, string[]>> ValidateAsync(InteractionRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Summary))
            errors["summary"] = ["חובה לכתוב תקציר"];
        else if (request.Summary.Trim().Length > Interaction.MaxSummaryLength)
            errors["summary"] = [$"התקציר ארוך מדי, עד {Interaction.MaxSummaryLength} תווים"];

        if (request.Channel is null)
            errors["channel"] = ["חובה לבחור ערוץ"];

        if (request.Direction is null)
            errors["direction"] = ["חובה לבחור מי פנה"];

        if (
            request.ApplicationId is { } applicationId
            && !await _applications.ExistsAsync(applicationId)
        )
            errors["applicationId"] = ["המשרה לא נמצאה. ייתכן שנמחקה"];

        return errors;
    }

    private static Result<InteractionResponse> Invalid(string field, string message) =>
        Result<InteractionResponse>.Invalid(
            new Dictionary<string, string[]> { [field] = [message] }
        );

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
