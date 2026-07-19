package ro.renovatorpro.adapter.out.persistence.springdata;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.renovatorpro.adapter.out.persistence.entity.ComparisonGroupEntity;

import java.util.List;

public interface ComparisonGroupJpaRepository extends JpaRepository<ComparisonGroupEntity, String> {

    List<ComparisonGroupEntity> findByRoomId(String roomId);

    List<ComparisonGroupEntity> findByRoomIdIn(List<String> roomIds);

    void deleteByRoomId(String roomId);
}
