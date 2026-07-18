package ro.renovatorpro.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.entity.RefreshTokenEntity;
import ro.renovatorpro.adapter.out.persistence.springdata.RefreshTokenJpaRepository;
import ro.renovatorpro.application.port.out.RefreshTokenRepository;
import ro.renovatorpro.application.port.out.TimeProvider;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RefreshTokenRepositoryAdapter implements RefreshTokenRepository {

    private final RefreshTokenJpaRepository jpaRepository;
    private final TimeProvider timeProvider;

    @Override
    public void insert(String id, String userId, String tokenHash, Instant expiresAt) {
        jpaRepository.save(new RefreshTokenEntity(id, userId, tokenHash, expiresAt, null, timeProvider.now()));
    }

    @Override
    public Optional<StoredToken> findByTokenHash(String tokenHash) {
        return jpaRepository.findByTokenHash(tokenHash).map(this::toStoredToken);
    }

    @Override
    public void revoke(String id) {
        jpaRepository.findById(id).ifPresent(entity -> {
            entity.setRevokedAt(timeProvider.now());
            jpaRepository.save(entity);
        });
    }

    @Override
    public void revokeAllForUser(String userId) {
        List<RefreshTokenEntity> active = jpaRepository.findByUserIdAndRevokedAtIsNull(userId);
        Instant now = timeProvider.now();
        active.forEach(entity -> entity.setRevokedAt(now));
        jpaRepository.saveAll(active);
    }

    private StoredToken toStoredToken(RefreshTokenEntity entity) {
        return new StoredToken(entity.getId(), entity.getUserId(), entity.getTokenHash(), entity.getExpiresAt(), entity.getRevokedAt());
    }
}
