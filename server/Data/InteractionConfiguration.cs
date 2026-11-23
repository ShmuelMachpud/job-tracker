using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Models;

namespace Server.Data;

public class InteractionConfiguration : IEntityTypeConfiguration<Interaction>
{
    public void Configure(EntityTypeBuilder<Interaction> builder)
    {
        builder.ToTable("Interactions");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Summary).IsRequired().HasMaxLength(Interaction.MaxSummaryLength);
        builder.Property(i => i.Channel).HasConversion<string>().HasMaxLength(20);
        builder.Property(i => i.Direction).HasConversion<string>().HasMaxLength(20);

        // בלי המגייס אין ליומן משמעות: מחיקת מגייס מוחקת גם את היומן שלו
        builder
            .HasOne<Recruiter>()
            .WithMany()
            .HasForeignKey(i => i.RecruiterId)
            .OnDelete(DeleteBehavior.Cascade);

        // מחיקת משרה משאירה את הרשומה ביומן, רק בלי הקישור למשרה
        builder
            .HasOne<JobApplication>()
            .WithMany()
            .HasForeignKey(i => i.ApplicationId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
