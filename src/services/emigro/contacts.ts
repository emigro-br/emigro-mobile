// src/services/emigro/contacts.ts
import { api } from '@/services/emigro/api';

/** UI-side shapes */
export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

export interface ContactPixKey {
  id: string;
  keyType: PixKeyType;
  keyValue: string;
  label?: string | null;
  isPrimary?: boolean | null;
  bankCode?: string | null;
  bankName?: string | null;
  accountType?: 'CHECKING' | 'SAVINGS' | 'PAYMENT' | 'WALLET' | null;
  branchNumber?: string | null;
  accountNumber?: string | null;
}

export interface Contact {
  id: string;
  displayName: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  isFavorite?: boolean | null;
  /** digits-only CPF/CNPJ coming from backend (contact.document_tax_id) */
  documentTaxId?: string | null;
  pixKeys?: ContactPixKey[];
}


/** Helper: map backend snake_case -> UI camelCase */
function mapPixKey(k: any): ContactPixKey {
  return {
    id: k.id,
    keyType: (k.key_type ?? k.keyType) as PixKeyType,
    keyValue: k.key_value ?? k.keyValue,
    label: k.label ?? null,
    isPrimary: (k.is_primary ?? k.isPrimary) ? true : false,
    bankCode: k.bank_code ?? k.bankCode ?? null,
    bankName: k.bank_name ?? k.bankName ?? null,
    accountType: k.account_type ?? k.accountType ?? null,
    branchNumber: k.branch_number ?? k.branchNumber ?? null,
    accountNumber: k.account_number ?? k.accountNumber ?? null,
  };
}

function mapContact(c: any): Contact {
  return {
    id: c.id,
    displayName: c.display_name ?? c.displayName ?? '',
    nickname: c.nickname ?? null,
    avatarUrl: c.avatar_url ?? c.avatarUrl ?? null,
    isFavorite: (c.is_favorite ?? c.isFavorite) ? true : false,
    documentTaxId: c.document_tax_id ?? c.documentTaxId ?? null,
    pixKeys: Array.isArray(c.pixKeys ?? c.pix_keys) ? (c.pixKeys ?? c.pix_keys).map(mapPixKey) : [],
  };
}


/** UI-only label (keep keyType = 'EVP' but show “Random Key”) */
export function displayKeyType(t: PixKeyType): string {
  return t === 'EVP' ? 'Random Key' : t;
}

/** GET /contacts (authorized) with mapping */
export async function listContacts(): Promise<Contact[]> {
  const res = await api().get('/contacts');
  const raw = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
  return raw.map(mapContact);
}
