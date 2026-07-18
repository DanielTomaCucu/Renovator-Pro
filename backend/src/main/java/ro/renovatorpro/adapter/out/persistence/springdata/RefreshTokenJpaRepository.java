package ro.renovatorpro.adapter.out.persistence.springdata;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.renovatorpro.adapter.out.persistence.entity.RefreshTokenEntity;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenJpaRepository extends JpaRepository<RefreshTokenEntity, String> {

    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);

    List<RefreshTokenEntity> findByUserIdAndRevokedAtIsNull(String userId);

    /** Doar pentru referință dacă e nevoie de audit — nefolosită operațional azi. */
    List<RefreshTokenEntity> findByExpiresAtBefore(Instant cutoff);
}
