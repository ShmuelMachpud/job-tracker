using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

/// <summary>
/// IDataProtectionKeyContext: המסד שומר גם את מפתחות ההצפנה של עוגיית ההתחברות (ראו DatabaseSetup).
/// </summary>
public class AppDbContext : DbContext, IDataProtectionKeyContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<JobApplication> Applications => Set<JobApplication>();

    public DbSet<Recruiter> Recruiters => Set<Recruiter>();

    public DbSet<Interaction> Interactions => Set<Interaction>();

    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
}
