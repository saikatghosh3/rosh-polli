import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminResource } from "@/lib/admin-data";
import { createAdminResource } from "@/lib/admin-mutations";
import { adminResourceModels } from "@/lib/admin-resources";
import { jsonError, readJson, sameOriginError } from "@/lib/http";
import { z } from "zod";

export const runtime = "nodejs";
import { handleApiError } from "@/lib/api-errors";

async function authorize() {
  await requireAdmin();
}

export async function GET(request, context) {
  try {
    await authorize();
    const { resource } = await context.params;
    if (!adminResourceModels[resource] && resource !== "customers") return jsonError("অ্যাডমিন বিভাগটি পাওয়া যায়নি।", 404);
    const searchParams = new URL(request.url).searchParams;
    const result = await getAdminResource(resource, { page: searchParams.get("page"), search: searchParams.get("q") });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "অ্যাডমিন তথ্য লোড করা যায়নি।");
  }
}

export async function POST(request, context) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    await authorize();
    const { resource } = await context.params;
    if (!adminResourceModels[resource]) return jsonError("অ্যাডমিন বিভাগটি পাওয়া যায়নি।", 404);
    const parsed = await readJson(request, z.unknown());
    if (!parsed.success) return parsed.response;
    const item = await createAdminResource(resource, parsed.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "তথ্য সংরক্ষণ করা যায়নি।");
  }
}
