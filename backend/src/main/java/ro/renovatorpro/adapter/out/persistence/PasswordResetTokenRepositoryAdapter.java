package ro.renovatorpro.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.entity.PasswordResetTokenEntity;
import ro.renovatorpro.adapter.out.persistence.springdata.PasswordResetTokenJpaRepository;
import ro.renovatorpro.application.port.out.PasswordResetTokenRepository;
import ro.renovatorpro.application.port.out.TimeProvider;

import java.time.Instant;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PasswordResetTokenRepositoryAdapter implements PasswordResetTokenRepository {

    private final PasswordResetTokenJpaRepository jpaRepository;
    private final TimeProvider timeProvider;

    @Override
    public void insert(String id, String userId, String tokenHash, Instant expiresAt) {
        jpaRepository.save(new PasswordResetTokenEntity(id, userId, tokenHash, expiresAt, null, timeProvider.now()));
    }

    @Override
    public Optional<StoredToken> findByTokenHash(String tokenHash) {
        return jpaRepository.findByTokenHash(tokenHash).map(this::toStoredToken);
    }

    @Override
    public void markUsed(String id) {
        jpaRepository.findById(id).ifPresent(entity -> {
            entity.setUsedAt(timeProvider.now());
            jpaRepository.save(entity);
        });
    }

    private StoredToken toStoredToken(PasswordResetTokenEntity entity) {
        return new StoredToken(entity.getId(), entity.getUserId(), entity.getTokenHash(), entity.getExpiresAt(), entity.getUsedAt());
    }
}
