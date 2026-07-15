/**
 * Implementările use case-urilor: orchestrare + {@code @Transactional}, fără logică de business proprie
 * (aceea trăiește în domain.service — ex. {@code UpdateRoomService} doar invocă {@code AutoItemReconciler}).
 * {@code currentUserId} e acceptat pe fiecare metodă dar neutilizat operațional până la Faza 5 (autorizare).
 */
package ro.renovatorpro.application.usecase;
