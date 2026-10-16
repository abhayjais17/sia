"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import { AnimatePresence, motion } from "framer-motion";
import {
  DatabaseZap,
  LockKeyhole,
  Network,
  ShieldCheck,
  UserRoundX,
} from "lucide-react";
import { AqurkIcon } from "@/components/brand/AqurkIcon";
import { EntryCard } from "./EntryCard";
import { AqurkShell } from "./AqurkShell";
import { ShareQrPopover } from "./ShareQrPopover";
import { InfoDialog, type InfoTopic } from "./InfoDialog";
import { HandshakeSteps } from "@/components/connect/HandshakeSteps";
import { WaitingRoom } from "@/components/connect/WaitingRoom";
import { RoomReady } from "@/components/connect/RoomReady";
import { SafetyCodeModal } from "@/components/safety/SafetyCodeModal";
import { DemoControls } from "@/components/dev/DemoControls";
import { useConnection } from "@/hooks/use-mock-connection";
import { createRoomLink } from "@/lib/passphrase";
import { cn } from "@/lib/utils";

export function AqurkExperience() {
  const router = useRouter();
  const session = useSession();
  const [confirmation, setConfirmation] = useState("");
  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get("session");
    if (state === "cleared" || state === "ended") { setConfirmation(state === "cleared" ? "Session cleared" : "Session ended"); window.history.replaceState(null, "", window.location.pathname + window.location.hash); }
  }, []);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [info, setInfo] = useState<InfoTopic>(null);
  const [reverify, setReverify] = useState(false);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const entryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const connection = useConnection({ paused: shareOpen || info !== null });
  useEffect(() => () => clearTimeout(entryTimer.current), []);
  const enter = () => {
    if (submitting) return;
    setSubmitting(true);
    entryTimer.current = setTimeout(() => {
      connection.connect();
      setSubmitting(false);
    }, 400);
  };

  useEffect(() => {
    const importInvitation = () => {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const invitation = fragment.get("code");
      if (invitation) {
        setCode(invitation.slice(0, 128));
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
    };
    importInvitation();
    setReady(true);
    window.addEventListener("hashchange", importInvitation);
    return () => window.removeEventListener("hashchange", importInvitation);
  }, []);

  const share = () => {
    setShareLink(createRoomLink(code));
    setShareOpen(true);
  };
  const leave = () => {
    clearTimeout(entryTimer.current);
    setSubmitting(false);
    connection.leave();
    setName("");
    setCode("");
    setShareLink("");
    setShareOpen(false);
    setReverify(false);
  };
  const finishSafety = (verified: boolean) => {
    session.start({
      name: name.trim(),
      verified,
      relay: connection.scenario === "relay",
    });
    setCode("");
    setShareLink("");
    connection.completeVerification(verified);
    setReverify(false);
    router.push("/chat");
  };
  const isEntry = connection.state === "idle";
  const safetyOpen = connection.state === "verification" || reverify;
  const progress = isEntry
    ? 0
    : connection.state === "connecting" ||
        connection.state === "failed" ||
        connection.state === "full"
      ? 1
      : connection.state === "waiting"
        ? 2
        : 3;
  const trust = [
    { icon: LockKeyhole, label: "Encryption · simulated" },
    { icon: UserRoundX, label: "No accounts" },
    { icon: DatabaseZap, label: "No stored data" },
    { icon: Network, label: "Peer-to-peer · simulated" },
  ];

  return (
    <AqurkShell onInfo={setInfo} onHome={leave}>
      <main
        className={cn("main-content", !isEntry && "connection-content")}
        data-ready={ready}
      >
        {confirmation && <p className="session-confirmation" role="status"><ShieldCheck className="size-4" />{confirmation}</p>}
        <AnimatePresence mode="wait">
          <motion.div
            key={isEntry ? "entry" : "connection"}
            className="experience-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {isEntry ? (
              <>
                <motion.div
                  className="hero"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  
                  <h1>
                    <span>Say it.</span>{" "}
                    <span>Hide it.</span>{" "}
                    <span className="gradient-text">Aqurk it.</span>
                  </h1>
                  <p>End-to-end encrypted, with no accounts or stored data.</p>
                </motion.div>
                <EntryCard
                  name={name}
                  code={code}
                  onNameChange={setName}
                  onCodeChange={setCode}
                  onEnter={enter}
                  onShare={share}
                  loading={submitting}
                />
</>
            ) : (
              <>
                <div className="flow-eyebrow">
                  <ShieldCheck className="size-3.5" />
                  {"A SPACE FOR JUST TWO"}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={
                      connection.state === "verification"
                        ? "waiting"
                        : connection.state
                    }
                    className="flow-container"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {connection.state === "connecting" ||
                    connection.state === "failed" ||
                    connection.state === "full" ? (
                      <HandshakeSteps
                        state={connection.state}
                        step={connection.step}
                        relay={connection.scenario === "relay"}
                        onCancel={connection.leave}
                        onRetry={() => {
                          connection.setScenario("normal");
                          connection.connect();
                        }}
                      />
                    ) : connection.state === "waiting" ||
                      connection.state === "verification" ? (
                      <WaitingRoom
                        name={name}
                        code={code}
                        stillWaiting={connection.stillWaiting}
                        onShare={share}
                        onLeave={leave}
                        isDemoPaused={connection.scenario === "wait"}
                      />
                    ) : (
                      <RoomReady
                        name={name}
                        verified={connection.verified}
                        onVerify={() => setReverify(true)}
                        onLeave={leave}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                <div
                  className="flow-progress"
                  aria-label={"Room setup progress"}
                >
                  {["Your space", "Connect", "Find your friend", "Verify"].map(
                    (label, index) => (
                      <span
                        key={label}
                        className={cn(index <= progress && "is-reached")}
                        aria-current={index === progress ? "step" : undefined}
                      >
                        <i />
                        {label}
                      </span>
                    ),
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <ShareQrPopover
          open={shareOpen}
          onOpenChange={setShareOpen}
          link={shareLink}
        />
        {safetyOpen && (
          <SafetyCodeModal
            open
            onVerify={() => finishSafety(true)}
            onSkip={() => finishSafety(false)}
            onLeave={leave}
          />
        )}
        <InfoDialog topic={info} onClose={() => setInfo(null)} />
        <DemoControls
          scenario={connection.scenario}
          onScenario={connection.setScenario}
          state={connection.state}
          onArrival={connection.simulateArrival}
        />
      </main>
    </AqurkShell>
  );
}

