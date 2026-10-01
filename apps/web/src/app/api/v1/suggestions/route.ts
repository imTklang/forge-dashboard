import { SuggestionInput } from "@forge/core";
import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { addSuggestions, clearSuggestions, listSuggestions } from "@/features/suggestions/service";

export const dynamic = "force-dynamic";
const dateOf = (req: Request) => new URL(req.url).searchParams.get("date") ?? undefined;

export const GET = (req: Request) => respond(async () => { await requireAuth(req, "read"); return listSuggestions(dateOf(req)); });
export const POST = (req: Request) => respond(async () => { await requireAuth(req, "write"); return addSuggestions(SuggestionInput.parse(await req.json())); }, 201);
export const DELETE = (req: Request) => respond(async () => { await requireAuth(req, "write"); return clearSuggestions(dateOf(req)); });
