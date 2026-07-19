package ro.renovatorpro.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ro.renovatorpro.adapter.out.persistence.entity.OfferEntity;
import ro.renovatorpro.domain.model.Offer;

@Mapper(componentModel = "spring")
public interface OfferEntityMapper {

    Offer toDomain(OfferEntity entity);

    OfferEntity toEntity(Offer offer);
}
