"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  ArrowUp,
  Camera,
  File as FileIcon,
  ImagePlus,
  LockKeyhole,
  Paperclip,
  Smile,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VoiceRecorder } from "./VoiceRecorder";
import { ReplyPreview } from "./ReplyPreview";
import type { Message } from "@/lib/types";
import { toast } from "sonner";
const EmojiPicker = dynamic(() => import("./EmojiPicker"), {
  loading: () => <p className="p-4 text-sm">Loading emoji…</p>,
});
export const MAX_FILE_SIZE = 200 * 1024 * 1024;
export function Composer({
  disabled,
  disabledReason,
  reply,
  clearReply,
  send,
  files,
}: {
  disabled: boolean;
  disabledReason: string;
  reply: Message | null;
  clearReply: () => void;
  send: (text: string, voiceDuration?: number) => void;
  files: (files: File[]) => void;
}) {
  const [text, setText] = useState("");
  const [sheet, setSheet] = useState<"emoji" | "attach" | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [pending, setPending] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const add = (items: File[]) => {
    if (disabled) return;
    const tooLarge = items.some((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge) {
      const message = "File too large. Max size is 200 MB.";
      setError(message);
      toast.error(message);
    } else setError("");
    setPending((p) =>
      [...p, ...items.filter((f) => f.size <= MAX_FILE_SIZE)].slice(0, 20),
    );
  };
  const submit = () => {
    if (disabled) return;
    if (text.trim()) send(text.trim());
    if (pending.length) files(pending);
    setText("");
    setPending([]);
    setSheet(null);
    if (textarea.current) textarea.current.style.height = "auto";
    textarea.current?.focus();
  };
  const chooseFiles = (accept: string) => {
    if (input.current) {
      input.current.accept = accept;
      input.current.click();
    }
    setSheet(null);
  };
  const camera = async () => {
    setSheet(null);
    try {
      const response = await fetch("/images/quiet-coast.png");
      if (!response.ok) throw new Error();
      add([
        new File([await response.blob()], "simulated-camera-photo.png", {
          type: "image/png",
        }),
      ]);
      toast.info("Demo camera photo added. Your camera was not accessed.");
    } catch {
      toast.error(
        "Could not load the demo photo. Choose a local image instead.",
      );
    }
  };
  return (
    <div
      className="composer-zone"
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        add(Array.from(e.dataTransfer.files));
      }}
    >
      {dragging && (
        <div className="drop-overlay">
          <Paperclip />
          Drop files to send
        </div>
      )}
      {reply && <ReplyPreview message={reply} onDismiss={clearReply} />}
      {pending.length > 0 && (
        <div className="attachment-previews">
          {pending.map((f, i) => (
            <span key={`${f.name}-${i}`}>
              <Paperclip className="size-3 shrink-0" />
              <span className="truncate">{f.name}</span>
              <button
                aria-label={`Remove ${f.name}`}
                onClick={() => setPending((p) => p.filter((_, j) => j !== i))}
              >
                <X className="size-4" />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="mb-2 text-xs text-destructive">
          {error}
        </p>
      )}
      <InputGroup className="chat-composer">
        <InputGroupTextarea
          ref={textarea}
          aria-label="Message"
          aria-describedby={disabled ? "composer-disabled" : undefined}
          placeholder={
            disabled
              ? "Sending is paused…"
              : "A little something, just for them…"
          }
          rows={1}
          value={text}
          maxLength={12000}
          disabled={disabled}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 144)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
              e.preventDefault();
              submit();
            }
          }}
          onPaste={(e) => {
            const images = Array.from(e.clipboardData.files).filter((f) =>
              f.type.startsWith("image/"),
            );
            if (images.length) {
              e.preventDefault();
              add(images);
            }
          }}
        />
        <InputGroupAddon align="block-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Choose emoji"
            disabled={disabled}
            onClick={() => setSheet("emoji")}
          >
            <Smile />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Attach files"
            disabled={disabled}
            onClick={() => setSheet("attach")}
          >
            <Paperclip />
          </Button>
          <span className="composer-hint">
            Enter to send · Shift + Enter for a new line
          </span>
          <div className="ml-auto">
            {text.trim() || pending.length ? (
              <Button
                variant="gradient"
                size="icon"
                aria-label="Send message"
                disabled={disabled}
                onClick={submit}
              >
                <ArrowUp />
              </Button>
            ) : (
              <VoiceRecorder
                disabled={disabled}
                send={(duration) => send("", duration)}
              />
            )}
          </div>
        </InputGroupAddon>
      </InputGroup>
      <input
        ref={input}
        type="file"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label="Select attachments"
        onChange={(e) => {
          add(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      {disabled && (
        <p
          id="composer-disabled"
          className="mt-2 text-center text-xs text-warning"
        >
          {disabledReason}
        </p>
      )}
      <Dialog
        open={sheet !== null}
        onOpenChange={(open) => !open && setSheet(null)}
      >
        <DialogContent className="aqurk-dialog composer-sheet">
          <DialogHeader>
            <DialogTitle>
              {sheet === "emoji"
                ? "A little more expression."
                : "Something to share?"}
            </DialogTitle>
            <DialogDescription>
              {sheet === "emoji"
                ? "Find the right emoji. Recents stay in memory only."
                : "Photos, videos and files up to 200 MB. Nothing leaves this device."}
            </DialogDescription>
          </DialogHeader>
          {sheet === "emoji" ? (
            <EmojiPicker
              recent={recent}
              setRecent={setRecent}
              onPick={(emoji) => setText((s) => (s + emoji).slice(0, 12000))}
            />
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                onClick={() => chooseFiles("image/*,video/*")}
              >
                <ImagePlus />
                Photo / Video
              </Button>
              <Button variant="secondary" onClick={() => chooseFiles("")}>
                <FileIcon />
                File
              </Button>
              <Button variant="secondary" onClick={camera}>
                <Camera />
                Camera · simulated photo
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setSheet(null);
              textarea.current?.focus();
            }}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
