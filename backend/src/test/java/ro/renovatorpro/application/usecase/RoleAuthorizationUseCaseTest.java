package ro.renovatorpro.application.usecase;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ro.renovatorpro.application.port.in.AddComparisonGroupUseCase;
import ro.renovatorpro.application.port.in.AddItemUseCase;
import ro.renovatorpro.application.port.in.AddOfferUseCase;
import ro.renovatorpro.application.port.in.AddRoomUseCase;
import ro.renovatorpro.application.port.in.DeleteItemUseCase;
import ro.renovatorpro.application.port.in.DeleteRoomUseCase;
import ro.renovatorpro.application.port.in.GetItemsUseCase;
import ro.renovatorpro.application.port.in.GetRoomsUseCase;
import ro.renovatorpro.application.port.in.Patch;
import ro.renovatorpro.application.port.in.UpdateItemUseCase;
import ro.renovatorpro.application.port.in.UpdateProjectUseCase;
import ro.renovatorpro.application.port.in.UpdateRoomUseCase;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ItemNotFoundException;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.exception.RoomNotFoundException;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomType;
import ro.renovatorpro.domain.model.user.ProjectRole;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Autorizare pe rol dincolo de ce acoperă {@code IdorAuthorizationIntegrationTest} (care testează
 * userul nemembru și EDITOR vs OWNER pe HTTP real). Aici, cu fake repositories (rapid, fără DB),
 * verificăm punctual matricea de roluri pe fiecare use case de scriere: VIEWER nu poate scrie NICĂIERI
 * (nici măcar camere/elemente), iar doar OWNER poate schimba proiectul — conform comentariului din
 * {@link ProjectRole}: "OWNER: control total ... EDITOR: CRUD camere/elemente ... VIEWER: doar citire."
 * Refuzul se manifestă mereu ca 404 (excepția *NotFound specifică resursei), niciodată 403 — D8.
 */
class RoleAuthorizationUseCaseTest {

    private static final String OWNER = "owner-user";
    private static final String EDITOR = "editor-user";
    private static final String VIEWER = "viewer-user";
    private static final String STRANGER = "stranger-user";
    private static final String PROJECT_ID = "p1";

    private FakeProjectRepository projectRepository;
    private FakeRoomRepository roomRepository;
    private FakeItemRepository itemRepository;
    private FakeComparisonGroupRepository comparisonGroupRepository;
    private FakeOfferRepository offerRepository;
    private FakeProjectMemberRepository projectMemberRepository;
    private FakeIdGenerator idGenerator;
    private FakeTimeProvider timeProvider;

    private AddRoomUseCase addRoom;
    private UpdateRoomUseCase updateRoom;
    private DeleteRoomUseCase deleteRoom;
    private GetRoomsUseCase getRooms;
    private AddItemUseCase addItem;
    private UpdateItemUseCase updateItem;
    private DeleteItemUseCase deleteItem;
    private GetItemsUseCase getItems;
    private UpdateProjectUseCase updateProject;
    private AddComparisonGroupUseCase addComparisonGroup;
    private AddOfferUseCase addOffer;

    private String roomId;
    private String itemId;

    @BeforeEach
    void setUp() {
        projectRepository = new FakeProjectRepository();
        roomRepository = new FakeRoomRepository();
        itemRepository = new FakeItemRepository();
        comparisonGroupRepository = new FakeComparisonGroupRepository();
        offerRepository = new FakeOfferRepository(comparisonGroupRepository);
        projectMemberRepository = new FakeProjectMemberRepository();
        idGenerator = new FakeIdGenerator();
        timeProvider = new FakeTimeProvider();

        projectRepository.seed(new Project(PROJECT_ID, "Proiect", Money.of(1000), Currency.EUR, null));
        projectMemberRepository.grant(PROJECT_ID, OWNER, ProjectRole.OWNER);
        projectMemberRepository.grant(PROJECT_ID, EDITOR, ProjectRole.EDITOR);
        projectMemberRepository.grant(PROJECT_ID, VIEWER, ProjectRole.VIEWER);
        // STRANGER nu e membru deloc.

        MembershipGuard guard = new MembershipGuard(projectMemberRepository);
        addRoom = new AddRoomService(roomRepository, idGenerator, guard);
        updateRoom = new UpdateRoomService(roomRepository, itemRepository, idGenerator, timeProvider, guard);
        deleteRoom = new DeleteRoomService(roomRepository, itemRepository, comparisonGroupRepository, offerRepository, new FakeInspirationImageRepository(), guard);
        getRooms = new GetRoomsService(roomRepository, guard);
        addItem = new AddItemService(itemRepository, roomRepository, idGenerator, timeProvider, guard);
        updateItem = new UpdateItemService(itemRepository, roomRepository, timeProvider, guard);
        deleteItem = new DeleteItemService(itemRepository, roomRepository, guard);
        getItems = new GetItemsService(roomRepository, itemRepository, guard);
        updateProject = new UpdateProjectService(projectRepository, guard);
        addComparisonGroup = new AddComparisonGroupService(comparisonGroupRepository, roomRepository, itemRepository, idGenerator, timeProvider, guard);
        addOffer = new AddOfferService(offerRepository, comparisonGroupRepository, roomRepository, idGenerator, timeProvider, guard);

        // Cameră + item create direct de OWNER, ca fixture pt. restul testelor.
        Room room = addRoom.execute(OWNER, PROJECT_ID,
                new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(500), null, null, null, null, null, null, null, null, null, null, null, null, null));
        roomId = room.id();
        Item item = addItem.execute(OWNER, new AddItemUseCase.Command(roomId, "Robinet", MaterialType.SANITARE, "",
                ItemStatus.IN_ASTEPTARE, BigDecimal.ONE, Money.of(50), null, null, ItemOrigin.MANUAL));
        itemId = item.id();
    }

    private static AddRoomUseCase.Command sampleRoomCommand() {
        return new AddRoomUseCase.Command(RoomType.DORMITOR, "Dormitor", Money.of(300), null, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    private static UpdateRoomUseCase.Command allAbsentUpdateCommand(String newName) {
        return new UpdateRoomUseCase.Command(
                null, newName, null,
                Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent());
    }

    private static AddItemUseCase.Command sampleItemCommand(String roomId) {
        return new AddItemUseCase.Command(roomId, "Vopsea", MaterialType.VOPSEA, "", ItemStatus.IN_ASTEPTARE,
                BigDecimal.ONE, Money.of(20), null, null, ItemOrigin.MANUAL);
    }

    @Test
    void viewerNuPoateAdaugaCamera() {
        assertThatThrownBy(() -> addRoom.execute(VIEWER, PROJECT_ID, sampleRoomCommand()))
                .isInstanceOf(ProjectNotFoundException.class);
    }

    @Test
    void strangerNuPoateAdaugaCamera() {
        assertThatThrownBy(() -> addRoom.execute(STRANGER, PROJECT_ID, sampleRoomCommand()))
                .isInstanceOf(ProjectNotFoundException.class);
    }

    @Test
    void editorPoateAdaugaCamera() {
        Room room = addRoom.execute(EDITOR, PROJECT_ID, sampleRoomCommand());
        assertThat(room.name()).isEqualTo("Dormitor");
    }

    @Test
    void viewerNuPoateActualizaCamera() {
        assertThatThrownBy(() -> updateRoom.execute(VIEWER, roomId, allAbsentUpdateCommand("Nume Nou")))
                .isInstanceOf(RoomNotFoundException.class);
    }

    @Test
    void viewerNuPoateStergeCamera() {
        assertThatThrownBy(() -> deleteRoom.execute(VIEWER, roomId)).isInstanceOf(RoomNotFoundException.class);
    }

    @Test
    void viewerPoateCitiCamerele() {
        assertThat(getRooms.execute(VIEWER, PROJECT_ID)).isNotEmpty();
    }

    @Test
    void strangerNuPoateCitiCamerele() {
        assertThatThrownBy(() -> getRooms.execute(STRANGER, PROJECT_ID)).isInstanceOf(ProjectNotFoundException.class);
    }

    @Test
    void viewerNuPoateAdaugaElement() {
        assertThatThrownBy(() -> addItem.execute(VIEWER, sampleItemCommand(roomId)))
                .isInstanceOf(RoomNotFoundException.class);
    }

    @Test
    void editorPoateAdaugaElement() {
        Item item = addItem.execute(EDITOR, sampleItemCommand(roomId));
        assertThat(item.name()).isEqualTo("Vopsea");
    }

    @Test
    void viewerNuPoateActualizaElement() {
        assertThatThrownBy(() -> updateItem.execute(VIEWER, itemId,
                new UpdateItemUseCase.Command("Nume Nou", null, null, null, null, null, null, null)))
                .isInstanceOf(ItemNotFoundException.class);
    }

    @Test
    void viewerNuPoateStergeElement() {
        assertThatThrownBy(() -> deleteItem.execute(VIEWER, itemId)).isInstanceOf(ItemNotFoundException.class);
    }

    @Test
    void viewerPoateCitiElementele() {
        assertThat(getItems.execute(VIEWER, PROJECT_ID)).isNotEmpty();
    }

    @Test
    void editorNuPoateActualizaProiectul() {
        // Doar OWNER modifică proiectul (buget/titlu) — EDITOR are CRUD camere/elemente, nu control de proiect.
        assertThatThrownBy(() -> updateProject.execute(EDITOR, PROJECT_ID,
                new UpdateProjectUseCase.Command("Titlu Nou", null, null, null)))
                .isInstanceOf(ProjectNotFoundException.class);
    }

    @Test
    void viewerNuPoateActualizaProiectul() {
        assertThatThrownBy(() -> updateProject.execute(VIEWER, PROJECT_ID,
                new UpdateProjectUseCase.Command("Titlu Nou", null, null, null)))
                .isInstanceOf(ProjectNotFoundException.class);
    }

    @Test
    void ownerPoateActualizaProiectul() {
        Project updated = updateProject.execute(OWNER, PROJECT_ID,
                new UpdateProjectUseCase.Command("Titlu Nou", null, null, null));
        assertThat(updated.title()).isEqualTo("Titlu Nou");
    }

    @Test
    void viewerNuPoateCreaGrupDeComparatie() {
        assertThatThrownBy(() -> addComparisonGroup.execute(VIEWER, roomId,
                new AddComparisonGroupUseCase.Command("Gresie Baie", MaterialType.GRESIE, null)))
                .isInstanceOf(RoomNotFoundException.class);
    }

    @Test
    void editorPoateCreaGrupDeComparatieSiOferta() {
        var group = addComparisonGroup.execute(EDITOR, roomId,
                new AddComparisonGroupUseCase.Command("Gresie Baie", MaterialType.GRESIE, null));
        var offer = addOffer.execute(EDITOR, group.id(),
                new AddOfferUseCase.Command(null, null, null, null, null, java.util.List.of(), null));
        assertThat(offer.groupId()).isEqualTo(group.id());
    }

    @Test
    void viewerNuPoateAdaugaOOferta() {
        var group = addComparisonGroup.execute(EDITOR, roomId,
                new AddComparisonGroupUseCase.Command("Gresie Baie", MaterialType.GRESIE, null));
        assertThatThrownBy(() -> addOffer.execute(VIEWER, group.id(),
                new AddOfferUseCase.Command(null, null, null, null, null, java.util.List.of(), null)))
                .isInstanceOf(ro.renovatorpro.domain.exception.ComparisonGroupNotFoundException.class);
    }

}
