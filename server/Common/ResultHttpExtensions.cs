namespace Server.Common;

public static class ResultHttpExtensions
{
    /// <summary>
    /// מתרגם את תוצאת השירות לתשובת HTTP. המקום היחיד שבו Result הופך לקוד HTTP,
    /// כדי שכל הנתיבים יענו באותה צורה.
    /// </summary>
    public static IResult ToHttpResult<T>(this Result<T> result, Func<T, IResult> onSuccess) =>
        result.Status switch
        {
            ResultStatus.Success => onSuccess(result.Value!),
            ResultStatus.NotFound => Results.NotFound(),
            ResultStatus.Invalid => Results.ValidationProblem(result.Errors),
            _ => Results.StatusCode(StatusCodes.Status500InternalServerError),
        };
}
