package ro.renovatorpro.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "project_members")
@IdClass(ProjectMemberEntity.Key.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberEntity {

    @Id
    @Column(name = "project_id")
    private String projectId;

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false)
    private String role;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @EqualsAndHashCode
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Key implements Serializable {
        private String projectId;
        private String userId;
    }
}
