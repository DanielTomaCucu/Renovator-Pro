package ro.renovatorpro.domain.model.user;

/**
 * Rolul unui utilizator pe un proiect (autorizare „pe drepturi", folosită efectiv în Faza 5).
 * OWNER: control total (proiect, membri, ștergere). EDITOR: CRUD camere/elemente. VIEWER: doar citire.
 */
public enum ProjectRole {
    OWNER,
    EDITOR,
    VIEWER
}
