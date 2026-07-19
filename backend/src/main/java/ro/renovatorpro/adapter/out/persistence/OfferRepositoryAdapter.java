package ro.renovatorpro.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.mapper.OfferEntityMapper;
import ro.renovatorpro.adapter.out.persistence.springdata.OfferJpaRepository;
import ro.renovatorpro.application.port.out.OfferRepository;
import ro.renovatorpro.domain.model.Offer;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OfferRepositoryAdapter implements OfferRepository {

    private final OfferJpaRepository jpaRepository;
    private final OfferEntityMapper mapper;

    @Override
    public Optional<Offer> findById(String id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Offer> findByGroupId(String groupId) {
        return jpaRepository.findByGroupId(groupId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Offer> findByGroupIds(List<String> groupIds) {
        return jpaRepository.findByGroupIdIn(groupIds).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Offer save(Offer offer) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(offer)));
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void deleteByGroupId(String groupId) {
        jpaRepository.deleteByGroupId(groupId);
    }

    @Override
    public void deleteByRoomId(String roomId) {
        jpaRepository.deleteByRoomId(roomId);
    }
}
