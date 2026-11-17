import type { ReactNode } from "react";
import type { ChatMessageDto } from "@/types/domain.types";
import { CalendarEventCard } from "./CalendarEventCard";
import { VaultCitationChip, WebCitationChip } from "./CitationChip";

function renderInlineBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function SafeStructuredMarkdown({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);

  return (
    <div className="clinical-prose space-y-3 text-text-primary">
      {blocks.map((block, blockIdx) => {
        const lines = block.split("\n").filter((l) => l.trim().length > 0);
        const isBulleted = lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l.trim()));
        const isNumbered = lines.length > 0 && lines.every((l) => /^\d+\.\s+/.test(l.trim()));

        if (isBulleted) {
          return (
            <ul key={blockIdx} className="list-disc space-y-1.5 pl-5">
              {lines.map((line, i) => (
                <li key={i}>{renderInlineBold(line.trim().replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        if (isNumbered) {
          return (
            <ol key={blockIdx} className="list-decimal space-y-2 pl-5">
              {lines.map((line, i) => (
                <li key={i}>{renderInlineBold(line.trim().replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={blockIdx} className="whitespace-pre-line">
            {renderInlineBold(block)}
          </p>
        );
      })}
    </div>
  );
}

export interface MessageBubbleProps {
  message: ChatMessageDto;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-accent-primary px-4 py-3 text-[15px] leading-[1.5] text-text-inverted sm:max-w-[75%]">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  const hasCitations = message.vaultCitations.length > 0 || message.webCitations.length > 0;

  return (
    <div className="flex justify-start">
      <div className="w-full space-y-3 rounded-lg border border-border-hairline bg-surface p-4 shadow-elevation-1 md:p-5">
        <div className="relative">
          <SafeStructuredMarkdown content={message.content} />
          {isStreaming && (
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-accent-primary align-middle"
            />
          )}
        </div>

        {message.calendarEventCreated && <CalendarEventCard event={message.calendarEventCreated} />}

        {hasCitations && (
          <div className="flex flex-wrap gap-2 border-t border-border-hairline pt-3">
            {message.vaultCitations.map((vc) => (
              <VaultCitationChip key={vc.documentId} citation={vc} />
            ))}
            {message.webCitations.map((wc) => (
              <WebCitationChip key={wc.url} citation={wc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
