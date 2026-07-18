"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/AuthProvider";
import { useAsyncAction } from "@/shared/useAsyncAction";
import { sharingApi } from "@/shared/api-client";
import { ProjectMember, ProjectRole } from "@/shared/types";
import { ACTION_ICONS, DOCUMENT_ICONS } from "@/shared/icons";
import Spinner from "./Spinner";
import ConfirmDialog from "./ConfirmDialog";

const ROLE_LABEL: Record<ProjectRole, string> = {
  [ProjectRole.Owner]: "Owner",
  [ProjectRole.Editor]: "Editor",
  [ProjectRole.Viewer]: "Viewer",
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "A apărut o eroare neașteptată. Încearcă din nou.";
}

/**
 * AUTH-7 (docs/cerinte-autentificare.md): codul de invitație (doar OWNER, generat leneș la prima
 * cerere) + lista de membri (vizibilă tuturor, ștergere doar OWNER). Folosit în /setari.
 */
export default function ProjectSharingCard() {
  const { session } = useAuth();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [members, setMembers] = useState<ProjectMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

  const isOwner = session?.role === ProjectRole.Owner;
  const projectId = session?.project.id;

  // Reîncărcare imperativă după ștergerea unui membru (nu la montare — vezi efectul de mai jos).
  const reloadMembers = useCallback(async () => {
    if (!projectId) return;
    try {
      setMembers(await sharingApi.listMembers(projectId));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    sharingApi
      .listMembers(projectId)
      .then((list) => {
        if (!cancelled) setMembers(list);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const { run: loadInviteCode, pending: loadingCode } = useAsyncAction(async () => {
    if (!projectId) return;
    try {
      const result = await sharingApi.getInviteCode(projectId);
      setInviteCode(result.inviteCode);
    } catch (err) {
      setError(errorMessage(err));
    }
  });

  const { run: handleCopy } = useAsyncAction(async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  });

  const handleRegenerate = async () => {
    if (!projectId) return;
    const result = await sharingApi.regenerateInviteCode(projectId);
    setInviteCode(result.inviteCode);
  };

  const handleRemoveMember = async () => {
    if (!projectId || !memberToRemove) return;
    await sharingApi.removeMember(projectId, memberToRemove.userId);
    setMemberToRemove(null);
    await reloadMembers();
  };

  if (!session) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <div className="border-b border-line bg-surface-low/50 p-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">{DOCUMENT_ICONS.share}</span>
          <h3 className="font-heading text-lg font-bold text-primary">Partajare proiect</h3>
        </div>
        <p className="text-sm text-muted">
          Invită un coleg să vadă și să editeze același proiect — introduce codul la Înregistrare, la
          „Mă alătur unui proiect”.
        </p>
      </div>

      <div className="space-y-6 p-6">
        {isOwner && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-muted">Cod de invitație</label>
            {inviteCode ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="flex-1 rounded-lg border border-line bg-surface-low px-4 py-3 font-mono text-sm tracking-widest text-primary">
                    {inviteCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 rounded-lg border border-line px-4 py-3 text-xs font-bold uppercase text-muted hover:bg-surface-low"
                  >
                    {copied ? "Copiat ✓" : "Copiază"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmRegenerate(true)}
                  className="text-xs font-semibold text-tertiary hover:underline"
                >
                  Regenerează codul
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={loadInviteCode}
                disabled={loadingCode}
                aria-busy={loadingCode}
                className="flex items-center gap-2 rounded-lg border border-line px-4 py-3 text-xs font-bold uppercase text-muted hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingCode && <Spinner />}
                Arată codul
              </button>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-muted">Membri</label>
          {members === null ? (
            <p className="text-sm text-muted">Se încarcă...</p>
          ) : (
            <ul className="divide-y divide-line rounded-lg border border-line">
              {members.map((member) => (
                <li key={member.userId} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="text-sm font-medium text-primary">{member.username}</span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        member.role === ProjectRole.Owner
                          ? "bg-secondary/10 text-secondary"
                          : "bg-line text-muted"
                      }`}
                    >
                      {ROLE_LABEL[member.role]}
                    </span>
                    {isOwner && member.userId !== session.user.id && (
                      <button
                        type="button"
                        onClick={() => setMemberToRemove(member)}
                        aria-label={`Șterge pe ${member.username} din proiect`}
                        className="text-muted hover:text-tertiary"
                      >
                        <span className="material-symbols-outlined text-[18px]">{ACTION_ICONS.delete}</span>
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm font-medium text-tertiary">{error}</p>}
      </div>

      <ConfirmDialog
        open={confirmRegenerate}
        title="Regenerezi codul de invitație?"
        message="Codul actual nu va mai funcționa pentru înregistrări noi. Membrii deja alăturați nu sunt afectați."
        onConfirm={async () => {
          await handleRegenerate();
          setConfirmRegenerate(false);
        }}
        onCancel={() => setConfirmRegenerate(false)}
      />
      <ConfirmDialog
        open={memberToRemove !== null}
        title="Elimini acest membru?"
        message={memberToRemove ? `${memberToRemove.username} va pierde accesul la proiect.` : ""}
        onConfirm={handleRemoveMember}
        onCancel={() => setMemberToRemove(null)}
      />
    </div>
  );
}
