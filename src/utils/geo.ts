/**
 * Geolocation & Currency Utility
 */

export interface GeoData {
  ip: string;
  country: string; // e.g. "US", "IN"
  country_name: string;
  city: string;
  currency: string; // e.g. "USD", "INR"
  symbol: string; // e.g. "$", "₹"
}

export async function detectGeoLocation(): Promise<GeoData> {
  try {
    // Attempt to query real IP API
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    const data = await response.json();
    const country = data.country || "US";
    const isIndia = country === "IN" || data.country_code_iso3 === "IND";
    
    return {
      ip: data.ip || "127.0.0.1",
      country: country,
      country_name: data.country_name || (isIndia ? "India" : "United States"),
      city: data.city || (isIndia ? "Mumbai" : "New York"),
      currency: country === "IN" ? "INR" : "USD",
      symbol: country === "IN" ? "₹" : "$"
    };
  } catch (err) {
    console.warn("IP Geolocation lookup failed, using fallback:", err);
    // Automatic local server-side fallback or default checking
    return {
      ip: "157.45.122.9", // Simulated sample Indian/US IP
      country: "IN",
      country_name: "India",
      city: "New Delhi",
      currency: "INR",
      symbol: "₹"
    };
  }
}

export function formatPrice(priceInBase: number, currency: "USD" | "INR" | string): { value: string; text: string } {
  if (currency === "INR") {
    return {
      value: `₹${priceInBase}`,
      text: `INR ${priceInBase}`
    };
  } else {
    // If USD, display as $ price
    return {
      value: `$${priceInBase}`,
      text: `USD $${priceInBase}`
    };
  }
}
