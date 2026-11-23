using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Common;
using Server.Models;

namespace Server.Data;

public class JobApplicationConfiguration : IEntityTypeConfiguration<JobApplication>
{
    private static readonly JsonSerializerOptions JsonOptions = CreateJsonOptions();

    public void Configure(EntityTypeBuilder<JobApplication> builder)
    {
        builder.ToTable("Applications");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Company).IsRequired().HasMaxLength(JobApplication.MaxNameLength);
        builder.Property(a => a.Role).IsRequired().HasMaxLength(JobApplication.MaxNameLength);

        // מחיקת מגייס לא מוחקת את המשרות שלו, רק מנתקת אותן
        builder
            .HasOne<Recruiter>()
            .WithMany()
            .HasForeignKey(a => a.RecruiterId)
            .OnDelete(DeleteBehavior.SetNull);

        // הסטטוס נשמר כטקסט ("Interview") ולא כמספר, כדי שהוספת סטטוס לא תשבש נתונים קיימים
        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);

        // ההיסטוריה נשמרת כעמודת JSON אחת. היא תמיד נקראת ונשמרת יחד עם המשרה
        builder
            .Property(a => a.History)
            .HasConversion(
                history => JsonSerializer.Serialize(history, JsonOptions),
                json =>
                    (IReadOnlyList<StatusChange>)(
                        JsonSerializer.Deserialize<List<StatusChange>>(json, JsonOptions)
                        ?? new List<StatusChange>()
                    )
            )
            .Metadata.SetValueComparer(HistoryComparer);
    }

    // EF צריך לדעת להשוות בין שתי היסטוריות, כדי לזהות שינוי
    private static readonly ValueComparer<IReadOnlyList<StatusChange>> HistoryComparer = new(
        (a, b) => a!.SequenceEqual(b!),
        list => list.Aggregate(0, (hash, change) => HashCode.Combine(hash, change.GetHashCode())),
        list => list.ToList()
    );

    private static JsonSerializerOptions CreateJsonOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        JsonSettings.Apply(options);
        return options;
    }
}
