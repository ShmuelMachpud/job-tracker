using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddAppliedTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeOnly>(
                name: "AppliedTime",
                table: "Applications",
                type: "time without time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AppliedTime",
                table: "Applications");
        }
    }
}
