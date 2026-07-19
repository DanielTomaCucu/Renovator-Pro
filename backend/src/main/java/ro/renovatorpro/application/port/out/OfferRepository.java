package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.Offer;

import java.util.List;
import java.util.Optional;

public interface OfferRepository {

    Optional<Offer> findById(String id);

    List<Offer> findByGroupId(String groupId);

    List<Offer> findByGroupIds(List<String> groupIds);

    Offer save(Offer offer);

    void deleteById(String id);

    void deleteByGroupId(String groupId);

    /** Cascade explicit la ștergerea unei camere — șterge ofertele tuturor grupurilor ei, într-un singur pas. */
    void deleteByRoomId(String roomId);
}
