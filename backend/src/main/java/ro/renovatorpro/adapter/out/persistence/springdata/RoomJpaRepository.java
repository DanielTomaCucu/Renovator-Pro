package ro.renovatorpro.adapter.out.persistence.springdata;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.renovatorpro.adapter.out.persistence.entity.RoomEntity;

import java.util.List;

public interface RoomJpaRepository extends JpaRepository<RoomEntity, String> {

    List<RoomEntity> findByProjectId(String projectId);
}
