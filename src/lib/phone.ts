// Accepts Australian mobile/landline numbers with a 0 or +61 prefix, in any
// common spacing/punctuation style (e.g. "0412 345 678", "(02) 9367 1000",
// "+61 412 345 678"). Valid area/mobile leading digits: 2, 3, 4, 5, 7, 8.
export function isValidAustralianPhone(phone: string): boolean {
  const normalized = phone.trim().replace(/[\s\-().]/g, "")
  return /^(?:\+?61|0)[234578]\d{8}$/.test(normalized)
}
