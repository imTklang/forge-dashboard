import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/format";

/** Selo discreto para conteúdo escrito por agente, com o horário. */
export function AgentBadge({ at }: { at?: string | null }) {
  return (
    <Badge variant="outline" className="font-normal text-muted-foreground">
      via agente{at && <span className="tabular-nums">· {formatTime(at)}</span>}
    </Badge>
  );
}
