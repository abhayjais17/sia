"use client";
import {
  ChevronLeft,
  EllipsisVertical,
  SlidersHorizontal,
  Info,
  LockKeyhole,
  LogOut,
  Moon,
  Phone,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Siren,
  Timer,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePreferences } from "@/components/AqurkProvider";
import type { Peer } from "@/lib/types";
export type ChatAction =
  | "safety"
  | "timer"
  | "settings"
  | "panic"
  | "leave"
  | "search"
  | "info"
  | "demo"
  | "voice"
  | "video";
export function ChatHeader({
  peer,
  verified,
  relay,
  action,
  disabled,
}: {
  peer: Peer;
  verified: boolean;
  relay: boolean;
  action: (action: ChatAction) => void;
  disabled: boolean;
}) {
  const { theme, setTheme } = usePreferences();
  return (
    <header className="chat-header">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Leave room"
        onClick={() => action("leave")}
      >
        <ChevronLeft />
      </Button>
      <div className="peer-avatar" aria-hidden="true">
        A<span className={peer.online ? "online" : "offline"} />
      </div>
      <div className="peer-heading">
        <h1>{peer.name}</h1>
        <p title={`${relay ? "Relayed" : "Direct (peer-to-peer)"}`}>
          {peer.typing && peer.online ? (
            <span className="header-typing">
              typing
              <span aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </span>
          ) : peer.online ? (
            "Online"
          ) : (
            "Offline"
          )}
          <span className="header-transport">
            {" "}
            Â· {relay ? "Relayed" : "Direct connection"}
          </span>
        </p>
      </div>
      <button
        className={`safety-status ${verified ? "text-success" : "text-warning"}`}
        aria-label={
          verified
            ? "Verified safety code"
            : "Unverified safety code"
        }
        title="Open safety info"
        onClick={() => action("safety")}
      >
        {verified ? (
          <ShieldCheck className="size-4" />
        ) : (
          <Shield className="size-4" />
        )}
      </button>
      <div className="chat-header-actions">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voice call"
          disabled={disabled}
          onClick={() => action("voice")}
        >
          <Phone />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Video call"
          disabled={disabled}
          onClick={() => action("video")}
        >
          <Video />
        </Button>
        <span className="chat-header-divider" />
        <Button
          variant="ghost"
          size="icon"
          className="desktop-search"
          aria-label="Search conversation"
          onClick={() => action("search")}
        >
          <Search />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="info-button"
          aria-label="Room information"
          onClick={() => action("info")}
        >
          <Info />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Room menu" />
            }
          >
            <EllipsisVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => action("search")}>
                <Search />
                Search conversation
              </DropdownMenuItem>
              <DropdownMenuItem className="mobile-room-action" onClick={() => action("info")}>
                <Info />Room information
              </DropdownMenuItem>
              {process.env.NEXT_PUBLIC_DEMO === "1" && <DropdownMenuItem onClick={() => action("demo")}>
                <SlidersHorizontal />Demo controls
              </DropdownMenuItem>}
              <DropdownMenuItem onClick={() => action("timer")}>
                <Timer />
                Disappearing messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => action("safety")}>
                <LockKeyhole />
                Safety code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => action("settings")}>
                <Settings2 />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Moon />
                Switch to {theme === "dark" ? "light" : "dark"} theme
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => action("panic")}>
                <Siren />
                Panic clear
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => action("leave")}>
                <LogOut />
                Leave room
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

