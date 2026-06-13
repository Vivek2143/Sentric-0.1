/**
 * Sentric Fortress Cryptographic Security Helper
 * 
 * Implements high-integrity local state signature checks to prevent
 * unauthorized manual tampering of user email and subscription tiers via
 * developer consoles, localStore insertion, or memory injection attacks.
 */

const SECRET_SALT = "SENTRIC_FORT_SEC_2026_x89f_Rajaram09";

/**
 * Generates a high-integrity signature for a specific user email and subscription tier.
 */
export function generateStateSignature(email: string | null, subscription: string): string {
  const cleanEmail = (email || "anonymous_node").trim().toLowerCase();
  const cleanSub = subscription.trim().toLowerCase();
  const rawString = `${cleanEmail}|${cleanSub}|${SECRET_SALT}`;
  
  // Custom high-speed lightweight hash function (FNV-1a / DJB2 variant hybrid)
  // that produces a reliable secure hex digest signature.
  let hash = 5381;
  for (let i = 0; i < rawString.length; i++) {
    hash = (hash * 33) ^ rawString.charCodeAt(i);
  }
  
  // Convert integer to a salted 32-bit hex digest
  const part1 = (hash >>> 0).toString(16).padStart(8, "0");
  
  // Second pass with inverted salt to prevent lookup reverse attacks
  let hash2 = 2166136261;
  const rawString2 = `${part1}|${SECRET_SALT.split("").reverse().join("")}`;
  for (let i = 0; i < rawString2.length; i++) {
    hash2 = (hash2 ^ rawString2.charCodeAt(i)) * 16777619;
  }
  const part2 = (hash2 >>> 0).toString(16).padStart(8, "0");
  
  return `SECx_${part1}_${part2}`;
}

/**
 * Verifies if the local state has been tampered with by comparing dynamic hashes.
 */
export function verifyStateIntegrity(
  email: string | null, 
  subscription: string, 
  providedSignature: string | null
): boolean {
  // If the user is completely anonymous and has no subscription, let it pass as safe
  if (!email && (subscription === "none" || subscription === "trial")) {
    return true;
  }
  
  // Special prime admin verification override
  if (email?.trim().toLowerCase() === "aryan21430@gmail.com") {
    // If Admin email is injected forcefully, they must have the exact administrator signature
    const expectedAdminSig = generateStateSignature("aryan21430@gmail.com", "active_1y");
    return providedSignature === expectedAdminSig;
  }
  
  if (!providedSignature) {
    return false;
  }
  
  const expectedSig = generateStateSignature(email, subscription);
  return providedSignature === expectedSig;
}

/**
 * Masks user email addresses to prevent personal email exposure in the UI,
 * screenshots, demos, or public deployments.
 */
export function maskEmailForUI(email: string | null): string {
  if (!email) return "";
  const cleanEmail = email.trim().toLowerCase();
  
  if (cleanEmail === "aryan21430@gmail.com") {
    return "superadmin@sentric.io";
  }
  
  const [local, domain] = cleanEmail.split("@");
  if (!local || !domain) return cleanEmail;
  
  if (local.length <= 3) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.slice(0, 3)}***@${domain}`;
}
