package ro.renovatorpro.adapter.in.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ro.renovatorpro.adapter.in.web.dto.InviteCodeResponse;
import ro.renovatorpro.adapter.in.web.dto.ProjectMemberResponse;
import ro.renovatorpro.application.port.in.GetInviteCodeUseCase;
import ro.renovatorpro.application.port.in.ListProjectMembersUseCase;
import ro.renovatorpro.application.port.in.RegenerateInviteCodeUseCase;
import ro.renovatorpro.application.port.in.RemoveProjectMemberUseCase;

import java.util.List;

/** Partajare proiect (AUTH-7, docs/cerinte-autentificare.md) — cod de invitație + administrare membri, doar OWNER (cf. use case-uri). */
@RestController
@RequestMapping("/api/projects/{projectId}")
@RequiredArgsConstructor
public class ProjectMembersController {

    private final GetInviteCodeUseCase getInviteCodeUseCase;
    private final RegenerateInviteCodeUseCase regenerateInviteCodeUseCase;
    private final ListProjectMembersUseCase listProjectMembersUseCase;
    private final RemoveProjectMemberUseCase removeProjectMemberUseCase;

    @GetMapping("/invite-code")
    public InviteCodeResponse getInviteCode(@PathVariable String projectId) {
        return new InviteCodeResponse(getInviteCodeUseCase.execute(CurrentUser.id(), projectId));
    }

    @PostMapping("/invite-code/regenerate")
    public InviteCodeResponse regenerateInviteCode(@PathVariable String projectId) {
        return new InviteCodeResponse(regenerateInviteCodeUseCase.execute(CurrentUser.id(), projectId));
    }

    @GetMapping("/members")
    public List<ProjectMemberResponse> members(@PathVariable String projectId) {
        return listProjectMembersUseCase.execute(CurrentUser.id(), projectId).stream()
                .map(view -> new ProjectMemberResponse(view.userId(), view.username(), view.role().name()))
                .toList();
    }

    @DeleteMapping("/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@PathVariable String projectId, @PathVariable String userId) {
        removeProjectMemberUseCase.execute(CurrentUser.id(), projectId, userId);
    }
}
