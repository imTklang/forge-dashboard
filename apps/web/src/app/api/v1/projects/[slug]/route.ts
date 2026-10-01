import { ProjectUpdate } from "@forge/core";
import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { getProject, setRepo } from "@/features/projects/service";

type Ctx = { params: Promise<{ slug: string }> };

export const GET = (req: Request, { params }: Ctx) =>
  respond(async () => { await requireAuth(req, "read"); return getProject((await params).slug); });

export const PATCH = (req: Request, { params }: Ctx) =>
  respond(async () => {
    await requireAuth(req, "write");
    return setRepo((await params).slug, ProjectUpdate.parse(await req.json()).repo);
  });
