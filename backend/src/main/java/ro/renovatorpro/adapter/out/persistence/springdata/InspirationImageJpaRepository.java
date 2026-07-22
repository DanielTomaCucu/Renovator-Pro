package ro.renovatorpro.adapter.out.persistence.springdata;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.renovatorpro.adapter.out.persistence.entity.InspirationImageEntity;

import java.util.List;

public interface InspirationImageJpaRepository extends JpaRepository<InspirationImageEntity, String> {

    List<InspirationImageEntity> findByProjectId(String projectId);

    /** La ștergerea unei camere: pozele rămân, doar se dezasignează (vezi V9 — {@code ON DELETE SET NULL} e backup de schemă). */
    @Modifying
    @Query("UPDATE InspirationImageEntity i SET i.roomId = null WHERE i.roomId = :roomId")
    void clearRoomId(@Param("roomId") String roomId);
}
