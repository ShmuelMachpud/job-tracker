namespace Server.Common;

public enum ResultStatus
{
    Success,
    NotFound,
    Invalid,
}

public record Result<T>
{
    public ResultStatus Status { get; private init; }
    public T? Value { get; private init; }
    public IReadOnlyDictionary<string, string[]> Errors { get; private init; } =
        new Dictionary<string, string[]>();

    public static Result<T> Success(T value) =>
        new() { Status = ResultStatus.Success, Value = value };

    public static Result<T> NotFound() => new() { Status = ResultStatus.NotFound };

    public static Result<T> Invalid(IReadOnlyDictionary<string, string[]> errors) =>
        new() { Status = ResultStatus.Invalid, Errors = errors };
}
