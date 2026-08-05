// Company details shown in Settings → Company. Stored as a single JSON blob
// in the Setting key-value table (same pattern as pricing rules and
// notification prefs) — there's no dedicated model since it's a single
// record, not a list.

export interface CompanyDetails {
  name: string
  abn: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  postcode: string
}

export const DEFAULT_COMPANY_DETAILS: CompanyDetails = {
  name: "WAYZO PTY LTD",
  abn: "99 700 912 698",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  postcode: "",
}
