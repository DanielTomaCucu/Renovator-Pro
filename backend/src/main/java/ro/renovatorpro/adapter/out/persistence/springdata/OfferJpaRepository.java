package ro.renovatorpro.adapter.out.persistence.springdata;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import ro.renovatorpro.adapter.out.persistence.entity.OfferEntity;

import java.util.List;

public interface OfferJpaRepository extends JpaRepository<OfferEntity, String> {

    List<OfferEntity> findByGroupId(String groupId);

    List<OfferEntity> findByGroupIdIn(List<String> groupIds);

    void deleteByGroupId(String groupId);

    /** Ofertele nu au coloană room_id direct — ștergere prin subselect pe grupurile camerei (cascade la ștergerea camerei). */
    @Modifying
    @Query("DELETE FROM OfferEntity o WHERE o.groupId IN (SELECT g.id FROM ComparisonGroupEntity g WHERE g.roomId = :roomId)")
    void deleteByRoomId(String roomId);
}
