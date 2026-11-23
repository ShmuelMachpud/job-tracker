using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddRecruiters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RecruiterId",
                table: "Applications",
                type: "uuid",
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "Recruiters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: false
                    ),
                    Kind = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false
                    ),
                    Company = table.Column<string>(type: "text", nullable: true),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    LinkedIn = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    LastContactAt = table.Column<DateOnly>(type: "date", nullable: true),
                    NextAction = table.Column<string>(type: "text", nullable: true),
                    NextActionAt = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    UpdatedAt = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recruiters", x => x.Id);
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Applications_RecruiterId",
                table: "Applications",
                column: "RecruiterId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Recruiters_RecruiterId",
                table: "Applications",
                column: "RecruiterId",
                principalTable: "Recruiters",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Recruiters_RecruiterId",
                table: "Applications"
            );

            migrationBuilder.DropTable(name: "Recruiters");

            migrationBuilder.DropIndex(name: "IX_Applications_RecruiterId", table: "Applications");

            migrationBuilder.DropColumn(name: "RecruiterId", table: "Applications");
        }
    }
}
