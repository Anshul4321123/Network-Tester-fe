// utils/ispDetector.ts - FIXED with better error handling
export interface ISPInfo {
  isp: string;
  org: string;
  ip: string;
  country: string;
  city: string;
  region: string;
  timestamp: number;
}

const ISP_CACHE_KEY = "cached_isp_info";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function detectISP(): Promise<ISPInfo | null> {
  // Check cache first
  const cached = localStorage.getItem(ISP_CACHE_KEY);
  if (cached) {
    try {
      const parsed: ISPInfo = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION && parsed.isp !== "Unknown") {
        console.log("Using cached ISP:", parsed.isp);
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse cached ISP:", e);
    }
  }

  // Try multiple CORS-enabled APIs with better timeout handling
  const apis = [
    {
      url: "https://ipapi.co/json/",
      parser: (data: any) => ({
        isp: data.org || "Unknown ISP",
        org: data.org || "",
        ip: data.ip || "",
        country: data.country_name || "Unknown",
        city: data.city || "Unknown",
        region: data.region || "",
      }),
      timeout: 8000
    },
    {
      url: "https://ipinfo.io/json",
      parser: (data: any) => ({
        isp: data.org || "Unknown ISP",
        org: data.org || "",
        ip: data.ip || "",
        country: data.country || "Unknown",
        city: data.city || "Unknown",
        region: data.region || "",
      }),
      timeout: 8000
    }
  ];

  for (const api of apis) {
    try {
      console.log(`Attempting to fetch ISP from: ${api.url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`Timeout for ${api.url}, aborting...`);
        controller.abort();
      }, api.timeout);
      
      const response = await fetch(api.url, {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`ISP data received from ${api.url}:`, data);
        
        if (data && !data.error) {
          const parsed = api.parser(data);
          const ispInfo: ISPInfo = {
            ...parsed,
            timestamp: Date.now(),
          };
          
          localStorage.setItem(ISP_CACHE_KEY, JSON.stringify(ispInfo));
          console.log("ISP detected and cached:", ispInfo.isp);
          return ispInfo;
        }
      } else {
        console.log(`Response not OK from ${api.url}:`, response.status);
      }
    } catch (error) {
      console.error(`API failed for ${api.url}:`, error);
      // Continue to next API
    }
  }

  // Fallback: return cached even if expired
  const expiredCached = localStorage.getItem(ISP_CACHE_KEY);
  if (expiredCached) {
    try {
      const parsed: ISPInfo = JSON.parse(expiredCached);
      console.log("Using expired cached ISP as fallback:", parsed.isp);
      return parsed;
    } catch (e) {}
  }

  console.log("All ISP detection methods failed");
  return null;
}

export function getCachedISP(): ISPInfo | null {
  const cached = localStorage.getItem(ISP_CACHE_KEY);
  if (cached) {
    try {
      const parsed: ISPInfo = JSON.parse(cached);
      return parsed;
    } catch (e) {
      console.error("Failed to parse cached ISP:", e);
    }
  }
  return null;
}

export function saveManualISP(isp: string) {
  console.log("Saving manual ISP:", isp);
  localStorage.setItem("manual_isp", isp);
  // Also update cache
  const cached = getCachedISP();
  if (cached) {
    cached.isp = isp;
    cached.timestamp = Date.now();
    localStorage.setItem(ISP_CACHE_KEY, JSON.stringify(cached));
    console.log("Updated cache with manual ISP");
  } else {
    // Create a new cache entry
    const newISPInfo: ISPInfo = {
      isp: isp,
      org: "",
      ip: "",
      country: "Unknown",
      city: "Unknown",
      region: "",
      timestamp: Date.now(),
    };
    localStorage.setItem(ISP_CACHE_KEY, JSON.stringify(newISPInfo));
    console.log("Created new cache entry with manual ISP");
  }
}

export function getManualISP(): string | null {
  const manual = localStorage.getItem("manual_isp");
  console.log("Retrieved manual ISP:", manual);
  return manual;
}