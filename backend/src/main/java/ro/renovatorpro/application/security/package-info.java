/**
 * Autorizare pe membership (Faza 5, Task 5.2): {@link ro.renovatorpro.application.security.MembershipGuard}
 * e colaboratorul folosit de use case-urile existente (Room/Item/Project) ca să verifice rolul userului
 * curent pe proiectul din care face parte resursa. Nu e un „use case" propriu-zis (niciun controller nu-l
 * apelează direct), de-asta stă separat de {@code application.usecase}.
 */
package ro.renovatorpro.application.security;
