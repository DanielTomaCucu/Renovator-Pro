package ro.renovatorpro.adapter.out.persistence.springdata;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.renovatorpro.adapter.out.persistence.entity.ItemEntity;

import java.util.List;

public interface ItemJpaRepository extends JpaRepository<ItemEntity, String> {

    List<ItemEntity> findByRoomId(String roomId);

    List<ItemEntity> findByRoomIdIn(List<String> roomIds);

    void deleteByRoomId(String roomId);
}
