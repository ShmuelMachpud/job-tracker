using Server.Models;

namespace Server.Contracts;

public record ChangeStatusRequest(ApplicationStatus? Status);
