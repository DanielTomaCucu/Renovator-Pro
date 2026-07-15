package ro.renovatorpro.adapter.out.persistence.springdata;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.renovatorpro.adapter.out.persistence.entity.ProjectEntity;

public interface ProjectJpaRepository extends JpaRepository<ProjectEntity, String> {
}
