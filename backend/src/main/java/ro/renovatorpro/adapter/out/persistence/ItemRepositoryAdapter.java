package ro.renovatorpro.adapter.out.persistence;

import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.mapper.ItemEntityMapper;
import ro.renovatorpro.adapter.out.persistence.springdata.ItemJpaRepository;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.domain.model.Item;

import java.util.List;
import java.util.Optional;

@Component
public class ItemRepositoryAdapter implements ItemRepository {

    private final ItemJpaRepository jpaRepository;
    private final ItemEntityMapper mapper;

    public ItemRepositoryAdapter(ItemJpaRepository jpaRepository, ItemEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<Item> findById(String id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Item> findByRoomId(String roomId) {
        return jpaRepository.findByRoomId(roomId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Item> findByRoomIds(List<String> roomIds) {
        return jpaRepository.findByRoomIdIn(roomIds).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Item save(Item item) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(item)));
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void deleteByRoomId(String roomId) {
        jpaRepository.deleteByRoomId(roomId);
    }
}
