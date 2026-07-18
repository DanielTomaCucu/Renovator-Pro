package ro.renovatorpro.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.in.web.dto.UserResponse;
import ro.renovatorpro.domain.model.user.User;

@Mapper(componentModel = "spring")
public interface AuthDtoMapper {

    UserResponse toUserResponse(User user);
}
