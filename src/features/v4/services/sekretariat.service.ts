import { apiRequest } from "@/lib/api-client";
import type { V4RequestState } from "./v4-services";

export type V4SekretariatScope = "pusat" | "regional";

export interface V4LetterItem {
  id: string;
  direction: "incoming" | "outgoing";
  scope: V4SekretariatScope;
  regionId: string | null;
  letterNumber: string | null;
  originNumber: string | null;
  subject: string;
  documentType: string;
  senderName: string | null;
  recipientName: string | null;
  signerName: string | null;
  signerPosition: string | null;
  letterDate: string | null;
  receivedAt: string | null;
  status: string | null;
  finalFileUrl: string | null;
  scanFileUrl: string | null;
  validationQrUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface V4SignatureItem {
  id: string;
  scope: V4SekretariatScope;
  regionId: string | null;
  leaderName: string;
  positionName: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface V4TemplatePositionItem {
  id: string;
  scope: V4SekretariatScope;
  regionId: string | null;
  documentType: string;
  numberX: number | string;
  numberY: number | string;
  signatureX: number | string;
  signatureY: number | string;
  qrX: number | string;
  qrY: number | string;
  fontSize: number;
  targetPage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LetterListResponse {
  letters?: V4LetterItem[];
}

interface SignatureListResponse {
  signatures?: V4SignatureItem[];
}

interface TemplateListResponse {
  templates?: V4TemplatePositionItem[];
}

function scopeQuery(scope: V4SekretariatScope) {
  return `scope=${encodeURIComponent(scope)}`;
}

async function safeList<T>(path: string, key: keyof T, fallbackMessage: string): Promise<V4RequestState<NonNullable<T[keyof T]>>> {
  try {
    const response = await apiRequest<T>(path);
    return { data: (response[key] ?? []) as NonNullable<T[keyof T]>, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : fallbackMessage,
    };
  }
}

export function getIncomingLetters(scope: V4SekretariatScope) {
  return safeList<LetterListResponse>(
    `/api/letters?type=incoming&${scopeQuery(scope)}`,
    "letters",
    "Gagal memuat surat masuk",
  ) as Promise<V4RequestState<V4LetterItem[]>>;
}

export function getOutgoingLetters(scope: V4SekretariatScope) {
  return safeList<LetterListResponse>(
    `/api/letters?type=outgoing&${scopeQuery(scope)}`,
    "letters",
    "Gagal memuat surat keluar",
  ) as Promise<V4RequestState<V4LetterItem[]>>;
}

export function getSignatures(scope: V4SekretariatScope) {
  return safeList<SignatureListResponse>(
    `/api/signatures?${scopeQuery(scope)}`,
    "signatures",
    "Gagal memuat asset TTD",
  ) as Promise<V4RequestState<V4SignatureItem[]>>;
}

export function getTemplates(scope: V4SekretariatScope) {
  return safeList<TemplateListResponse>(
    `/api/templates?${scopeQuery(scope)}`,
    "templates",
    "Gagal memuat template surat",
  ) as Promise<V4RequestState<V4TemplatePositionItem[]>>;
}
