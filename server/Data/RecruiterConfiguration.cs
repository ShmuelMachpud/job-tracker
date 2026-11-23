using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Models;

namespace Server.Data;

public class RecruiterConfiguration : IEntityTypeConfiguration<Recruiter>
{
    public void Configure(EntityTypeBuilder<Recruiter> builder)
    {
        builder.ToTable("Recruiters");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name).IsRequired().HasMaxLength(Recruiter.MaxNameLength);

        // נשמר כטקסט ("Agency") ולא כמספר, כמו הסטטוס של משרה
        builder.Property(r => r.Kind).HasConversion<string>().HasMaxLength(20);
    }
}
