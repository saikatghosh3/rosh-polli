import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminRecord } from "@/lib/admin-data";
import { deleteAdminResource, updateAdminResource } from "@/lib/admin-mutations";
import { adminResourceModels } from "@/lib/admin-resources";
import { jsonError, readJson, sameOriginError } from "@/lib/http";
import { z } from "zod";

export const runtime = "nodejs";
import { handleApiError } from "@/lib/api-errors";

function validResourceId(resource, id) {
  if (resource === "hero") return id === "home";
  if (resource === "settings") return id === "site";
  if (resource === "customers") return typeof id === "string" && id.trim().length >= 5 && id.length <= 80 && !id.includes("/");
  return mongoose.isValidObjectId(id);
}

async function authorize() {
  return requireAdmin();
}

export async function GET(request, context) {
  try {
    await authorize();
    const { resource, id } = await context.params;
    if (!adminResourceModels[resource] || !validResourceId(resource, id)) return jsonError("তথ্যটি পাওয়া যায়নি।", 404);
    const item = await getAdminRecord(resource, id);
    if (!item) return jsonError("তথ্যটি পাওয়া যায়নি।", 404);
    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError(error, "তথ্য লোড করা যায়নি।");
  }
}

export async function PATCH(request, context) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    const admin = await authorize();
    const { resource, id } = await context.params;
    if ((!adminResourceModels[resource] && resource !== "customers") || !validResourceId(resource, id)) return jsonError("তথ্যটি পাওয়া যায়নি।", 404);
    const parsed = await readJson(request, z.unknown());
    if (!parsed.success) return parsed.response;
    const item = await updateAdminResource(resource, id, parsed.data, admin.id);
    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError(error, "তথ্য হালনাগাদ করা যায়নি।");
  }
}

export async function DELETE(request, context) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  try {
    await authorize();
    const { resource, id } = await context.params;
    if ((!adminResourceModels[resource] && resource !== "customers") || !validResourceId(resource, id)) return jsonError("তথ্যটি পাওয়া যায়নি।", 404);
    await deleteAdminResource(resource, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "তথ্য মুছে ফেলা যায়নি।");
  }
}
