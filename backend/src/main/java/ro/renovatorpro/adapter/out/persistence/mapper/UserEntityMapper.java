package ro.renovatorpro.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.out.persistence.entity.UserEntity;
import ro.renovatorpro.domain.model.user.User;

@Mapper(componentModel = "spring")
public interface UserEntityMapper {

    User toDomain(UserEntity entity);

    UserEntity toEntity(User user);
}
