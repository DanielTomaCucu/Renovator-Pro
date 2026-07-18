package ro.renovatorpro.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ro.renovatorpro.adapter.out.persistence.mapper.UserEntityMapper;
import ro.renovatorpro.adapter.out.persistence.springdata.UserJpaRepository;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.domain.model.user.User;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepository {

    private final UserJpaRepository jpaRepository;
    private final UserEntityMapper mapper;

    @Override
    public Optional<User> findById(String id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return jpaRepository.findByUsernameIgnoreCase(username).map(mapper::toDomain);
    }

    @Override
    public User insert(User user) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(user)));
    }
}
