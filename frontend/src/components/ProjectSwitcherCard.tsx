"use client";

import { useState } from "react";
import { useAuth } from "@/shared/AuthProvider";
import { useAsyncAction } from "@/shared/useAsyncAction";
import { ProjectRole } from "@/shared/types";
import { SETTINGS_ICONS } from "@/shared/icons";
import { Field, inputCls } from "./forms";
import Spinner from "./Spinner";

const ROLE_LABEL: Record<ProjectRole, string> = {
  [ProjectRole.Owner]: "Owner",
  [ProjectRole.Editor]: "Editor",
  [ProjectRole.Viewer]: "Viewer",
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "A apărut o eroare neașteptată. Încearcă din nou.";
}

/**
 * Multi-proiect (revizuire D4/D6, docs/cerinte-autentificare.md): comutare între proiectele la care
 * userul e deja membru + alăturare la un proiect NOU printr-un cod de invitație, fără cont nou — codul nu
 * mai e utilizabil doar la Înregistrare. Folosit în /setari, lângă `ProjectSharingCard`.
 */
export default function ProjectSwitcherCard() {
  const { session, projects, switchProject, joinProject } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const { run: handleJoin, pending: joining } = useAsyncAction(async () => {
    setJoinError(null);
    try {
      await joinProject(inviteCode.trim());
      setInviteCode("");
    } catch (err) {
      setJoinError(errorMessage(err));
    }
  });

  const { run: handleSwitch, pending: switching } = useAsyncAction(async (projectId: string) => {
    setSwitchError(null);
    setSwitchingId(projectId);
    try {
      await switchProject(projectId);
    } catch (err) {
      setSwitchError(errorMessage(err));
    } finally {
      setSwitchingId(null);
    }
  });

  if (!session) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <div className="border-b border-line bg-surface p-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">{SETTINGS_ICONS.switchProject}</span>
          <h3 className="font-heading text-lg font-bold text-primary">Proiectele mele</h3>
        </div>
        <p className="text-sm text-muted">
          Comută între proiectele la care ești membru, sau alătură-te unui proiect nou cu un cod de invitație.
        </p>
      </div>

      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-muted">Proiecte</label>
          <ul className="divide-y divide-line rounded-lg border border-line">
            {projects.map((p) => {
              const isActive = p.project.id === session.project.id;
              return (
                <li key={p.project.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">{p.project.title}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
                      {ROLE_LABEL[p.role]}
                    </span>
                  </div>
                  {isActive ? (
                    <span className="shrink-0 rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary">
                      Activ
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSwitch(p.project.id)}
                      disabled={switching}
                      aria-busy={switching && switchingId === p.project.id}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-muted hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {switching && switchingId === p.project.id && <Spinner />}
                      Comută
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {switchError && <p className="text-sm font-medium text-tertiary">{switchError}</p>}
        </div>

        <div className="space-y-2 border-t border-line pt-6">
          <Field label="Alătură-te unui alt proiect">
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="ex: K7XMQ2NP3A"
                className={`${inputCls} flex-1 font-mono uppercase`}
              />
              <button
                type="button"
                onClick={handleJoin}
                disabled={joining || !inviteCode.trim()}
                aria-busy={joining}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {joining && <Spinner />}
                Alătură-te
              </button>
            </div>
          </Field>
          {joinError && <p className="text-sm font-medium text-tertiary">{joinError}</p>}
        </div>
      </div>
    </div>
  );
}
