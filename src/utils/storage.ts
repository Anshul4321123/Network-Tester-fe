// utils/storage.ts - FULLY FIXED
export interface SpeedTestRecord {
  date: string;
  ping: number;
  jitter: number;
  download: number;
  upload: number;
  score: number;
  customName?: string;
  originalIsp?: string;
  isp?: string;
  networkType?: string;
  hour?: number;
  networkFingerprint?: string;
  ip?: string;
}

export interface BestStats {
  bestDownload: number;
  bestUpload: number;
  bestPing: number;
  bestScore: number;
}

export interface TestSelection {
  ping: boolean;
  jitter: boolean;
  download: boolean;
  upload: boolean;
}

export interface Achievements {
  hasRunPing: boolean;
  hasRunJitter: boolean;
  hasRunDownload: boolean;
  hasRunUpload: boolean;
  hasRunFullTest: boolean;
}

export interface NetworkMapping {
  fingerprint: string;
  originalName: string;
  customName: string;
  lastSeen: number;
}

const KEY = "speed_test_history";
const BEST_SCORE_KEY = "bestScore";
const BEST_STATS_KEY = "bestStats";
const TEST_SELECTION_KEY = "test_selection";
const ACHIEVEMENTS_KEY = "achievements";
const ISP_MAPPING_KEY = "isp_mapping_v2";

// ============================================
// VPN DETECTION FUNCTIONS - FIXED
// ============================================

export function isVPNLikely(ispName: string): boolean {
  const lowerISP = ispName.toLowerCase();
  
  // First, check if it's a known residential ISP - definitely NOT VPN
  const residentialISP = [
    'auriganet', 'jio', 'airtel', 'vi', 'vodafone', 'idea', 'bsnl', 'mtnl',
    'comcast', 'spectrum', 'cox', 'verizon', 'att', 't-mobile', 'sprint',
    'broadband', 'fiber', 'cable', 'dsl', 'internet', 'telecom',
    'digital technologies', 'private limited', 'technologies pvt'
  ];
  
  for (const res of residentialISP) {
    if (lowerISP.includes(res)) {
      console.log(`🏠 Residential ISP detected: ${ispName}`);
      return false;
    }
  }
  
  // Only then check for VPN indicators
  const vpnIndicators = [
    'vpn', 'proxy', 'virtual', 'hide', 'secure', 'anonymizer',
    'm247', 'digitalocean', 'aws', 'amazon', 'azure', 'google cloud', 'cloudflare',
    'ovh', 'linode', 'vultr', 'hetzner', 'rackspace', 'proton'
  ];
  
  for (const indicator of vpnIndicators) {
    if (lowerISP.includes(indicator)) {
      console.log(`🛡️ VPN detected: ${ispName} contains "${indicator}"`);
      return true;
    }
  }
  
  return false;
}

export function setVPNState(isVPN: boolean) {
  localStorage.setItem("is_vpn_detected", isVPN ? "true" : "false");
}

export function getVPNState(): boolean {
  return localStorage.getItem("is_vpn_detected") === "true";
}

// ============================================
// NETWORK FINGERPRINT GENERATION - FIXED
// ============================================

// Generate fingerprint directly from IP (not from stored value)
export function generateFingerprintFromIp(ip: string, networkType: string): string {
  // Use FULL IP address for maximum specificity
  const isVPN = getVPNState();
  
  if (isVPN) {
    const vpnFingerprint = `vpn|${ip}|${networkType}`;
    return btoa(vpnFingerprint).substring(0, 32);
  }
  
  const fingerprint = `${ip}|${networkType}`;
  return btoa(fingerprint).substring(0, 32);
}

// Legacy function - kept for compatibility
export function generateNetworkFingerprint(ispName: string, networkType: string): string {
  const storedIpPrefix = localStorage.getItem("network_ip_prefix");
  const isVPN = getVPNState();
  
  if (isVPN) {
    const vpnFingerprint = `vpn|${ispName || "unknown"}|${networkType}`;
    return btoa(vpnFingerprint).substring(0, 32);
  }
  
  const fingerprint = `${storedIpPrefix || "unknown"}|${networkType}`;
  return btoa(fingerprint).substring(0, 32);
}

export function saveNetworkIpPrefix(ip: string, ispName: string) {
  const isVPN = isVPNLikely( ispName);
  setVPNState(isVPN);
  
  if (isVPN) {
    localStorage.setItem("network_ip_prefix", "vpn");
    localStorage.setItem("vpn_detected", "true");
    console.log("🛡️ VPN detected - using special fingerprint");
  } else {
    const ipPrefix = ip.split('.').slice(0, 2).join('.');
    localStorage.setItem("network_ip_prefix", ipPrefix);
    localStorage.setItem("vpn_detected", "false");
  }
}

// ============================================
// ISP MAPPING WITH FINGERPRINT
// ============================================

export function saveISPMapping(fingerprint: string, originalName: string, customName: string) {
  const mappings = JSON.parse(localStorage.getItem(ISP_MAPPING_KEY) || "{}");
  
  const existing = mappings[fingerprint];
  const finalOriginalName = existing?.originalName || originalName;
  
  mappings[fingerprint] = {
    fingerprint,
    originalName: finalOriginalName,
    customName: customName,
    lastSeen: Date.now()
  };
  localStorage.setItem(ISP_MAPPING_KEY, JSON.stringify(mappings));
  updateHistoryISPByFingerprint(fingerprint, customName, finalOriginalName);
}

export function getISPPreferredName(fingerprint: string, originalName: string): string {
  const mappings = JSON.parse(localStorage.getItem(ISP_MAPPING_KEY) || "{}");
  const mapping = mappings[fingerprint];
  if (mapping && mapping.customName) {
    return mapping.customName;
  }
  return originalName;
}

export function getAllNetworkMappings(): Record<string, NetworkMapping> {
  return JSON.parse(localStorage.getItem(ISP_MAPPING_KEY) || "{}");
}

export function getNetworkMapping(fingerprint: string): NetworkMapping | null {
  const mappings = getAllNetworkMappings();
  return mappings[fingerprint] || null;
}

export function updateHistoryISPByFingerprint(fingerprint: string, customName: string, originalName: string) {
  const history = getHistory();
  const updatedHistory = history.map(record => {
    if (record.networkFingerprint === fingerprint) {
      return { 
        ...record, 
        customName: customName,
        originalIsp: originalName,
        isp: customName
      };
    }
    return record;
  });
  localStorage.setItem(KEY, JSON.stringify(updatedHistory));
}

// ============================================
// MIGRATION FUNCTION
// ============================================

export function migrateAndFixHistory() {
  const data = localStorage.getItem(KEY);
  if (!data) return;
  
  const history: any[] = JSON.parse(data);
  let needsUpdate = false;
  
  const fixedHistory = history.map(record => {
    let modified = false;
    const fixedRecord = { ...record };
    
    let customName = fixedRecord.customName || fixedRecord.isp;
    let originalIsp = fixedRecord.originalIsp;
    
    if (customName && originalIsp === customName) {
      if (fixedRecord.networkFingerprint) {
        const mapping = getNetworkMapping(fixedRecord.networkFingerprint);
        if (mapping && mapping.originalName && mapping.originalName !== customName) {
          originalIsp = mapping.originalName;
          modified = true;
          needsUpdate = true;
        }
      }
      
      if (originalIsp === customName) {
        const match = customName.match(/^(.+?)\s*\((.+?)\)$/);
        if (match) {
          customName = match[1].trim();
          originalIsp = match[2].trim();
          modified = true;
          needsUpdate = true;
        }
      }
    }
    
    if (!originalIsp && customName) {
      originalIsp = customName;
      modified = true;
      needsUpdate = true;
    }
    
    if (!customName && originalIsp) {
      customName = originalIsp;
      modified = true;
      needsUpdate = true;
    }
    
    if (!fixedRecord.networkFingerprint && originalIsp) {
      fixedRecord.networkFingerprint = generateNetworkFingerprint(
        originalIsp, 
        fixedRecord.networkType || "unknown"
      );
      modified = true;
      needsUpdate = true;
    }
    
    if (modified) {
      fixedRecord.customName = customName;
      fixedRecord.originalIsp = originalIsp;
      fixedRecord.isp = customName;
    }
    
    return modified ? fixedRecord : record;
  });
  
  if (needsUpdate) {
    localStorage.setItem(KEY, JSON.stringify(fixedHistory));
    console.log("✅ History migration completed - fixed", fixedHistory.length, "records");
  }
}

// ============================================
// SAVE RESULT - COMPLETELY REWRITTEN
// ============================================

export function saveResult(record: SpeedTestRecord) {
  const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
  
  // Generate fingerprint from the actual IP in the record
  let fingerprint = record.networkFingerprint;
  
  if (!fingerprint && record.ip) {
    const networkType = record.networkType || "unknown";
    fingerprint = generateFingerprintFromIp(record.ip, networkType);
  }
  
  if (!fingerprint) {
    console.error("Cannot generate fingerprint - no IP provided");
    return;
  }
  
  // Check for existing mapping
  const mapping = getNetworkMapping(fingerprint);
  
  let originalIsp: string;
  let customName: string;
  const providedIsp = record.customName || record.isp || "Unknown";
  
  if (mapping) {
    originalIsp = mapping.originalName;
    customName = mapping.customName;
  } else {
    originalIsp = providedIsp;
    customName = providedIsp;
    saveISPMapping(fingerprint, originalIsp, customName);
  }
  
  const recordToSave = {
    date: record.date,
    ping: record.ping,
    jitter: record.jitter,
    download: record.download,
    upload: record.upload,
    score: record.score,
    customName: customName,
    originalIsp: originalIsp,
    isp: customName,
    networkType: record.networkType || "unknown",
    networkFingerprint: fingerprint,
    hour: record.hour || new Date().getHours(),
    ip: record.ip,
  };
  
  // Check for duplicate
  const isDuplicate = existing.some((r: SpeedTestRecord) => 
    r.date === recordToSave.date && 
    r.ping === recordToSave.ping && 
    r.download === recordToSave.download
  );
  
  if (!isDuplicate) {
    const updated = [recordToSave, ...existing];
    localStorage.setItem(KEY, JSON.stringify(updated));
    console.log("Saved test result:", {
      customName: recordToSave.customName,
      originalIsp: recordToSave.originalIsp,
      fingerprint,
      ip: recordToSave.ip
    });
  }
}

// ============================================
// GET HISTORY - FIXED
// ============================================

export function getHistory(): SpeedTestRecord[] {
  const data = localStorage.getItem(KEY);
  const history = data ? JSON.parse(data) : [];
  
  const migrationRun = localStorage.getItem("migration_run_v6");
  if (!migrationRun) {
    migrateAndFixHistory();
    localStorage.setItem("migration_run_v6", "true");
    return getHistory();
  }
  
  return history.map((record: any) => {
    let originalIsp = record.originalIsp;
    let customName = record.customName || record.isp;
    
    if (!originalIsp || originalIsp === customName) {
      if (record.networkFingerprint) {
        const mapping = getNetworkMapping(record.networkFingerprint);
        if (mapping && mapping.originalName) {
          originalIsp = mapping.originalName;
        }
      }
      
      if (!originalIsp && customName) {
        const match = customName.match(/^(.+?)\s*\((.+?)\)$/);
        if (match) {
          customName = match[1].trim();
          originalIsp = match[2].trim();
        } else {
          originalIsp = customName;
        }
      }
    }
    
    if (record.networkFingerprint) {
      const mapping = getNetworkMapping(record.networkFingerprint);
      if (mapping && mapping.customName && mapping.customName !== customName) {
        customName = mapping.customName;
      }
      if (mapping && mapping.originalName && (!originalIsp || originalIsp === customName)) {
        originalIsp = mapping.originalName;
      }
    }
    
    if (!customName || customName === "Unknown") {
      customName = originalIsp || "Unknown";
    }
    if (!originalIsp || originalIsp === "Unknown") {
      originalIsp = customName;
    }
    
    return {
      date: record.date,
      ping: record.ping,
      jitter: record.jitter,
      download: record.download,
      upload: record.upload,
      score: record.score,
      customName: customName,
      originalIsp: originalIsp,
      networkType: record.networkType || "unknown",
      networkFingerprint: record.networkFingerprint,
      hour: record.hour,
      ip: record.ip,
    };
  });
}

// Legacy function - keep for compatibility
export function updateHistoryISP(originalISP: string, newName: string) {
  const history = getHistory();
  const updatedHistory = history.map(record => {
    if (record.originalIsp === originalISP) {
      return { 
        ...record, 
        customName: newName,
        isp: newName
      };
    }
    return record;
  });
  localStorage.setItem(KEY, JSON.stringify(updatedHistory));
}

// ============================================
// PAGINATED HISTORY
// ============================================

export function getPaginatedHistory(page: number, pageSize: number = 20): { data: SpeedTestRecord[]; total: number } {
  const allHistory = getHistory();
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: allHistory.slice(start, end),
    total: allHistory.length
  };
}

// ============================================
// BEST SCORE & STATS
// ============================================

export function saveBestScore(score: number) {
  const best = localStorage.getItem(BEST_SCORE_KEY);
  if (!best || score > Number(best)) {
    localStorage.setItem(BEST_SCORE_KEY, score.toString());
  }
}

export function getBestScore(): number | null {
  const best = localStorage.getItem(BEST_SCORE_KEY);
  return best ? Number(best) : null;
}

export function saveBestStats(score: number, download: number, upload: number, ping: number) {
  const raw = localStorage.getItem(BEST_STATS_KEY);
  const existing: BestStats = raw
    ? JSON.parse(raw)
    : { bestDownload: 0, bestUpload: 0, bestPing: Infinity, bestScore: 0 };

  const updated: BestStats = {
    bestDownload: Math.max(existing.bestDownload, download),
    bestUpload: Math.max(existing.bestUpload, upload),
    bestPing: Math.min(existing.bestPing, ping),
    bestScore: Math.max(existing.bestScore, score),
  };

  localStorage.setItem(BEST_STATS_KEY, JSON.stringify(updated));
}

export function getBestStats(): BestStats | null {
  const raw = localStorage.getItem(BEST_STATS_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ============================================
// TEST SELECTION
// ============================================

export function saveTestSelection(selection: TestSelection) {
  localStorage.setItem(TEST_SELECTION_KEY, JSON.stringify(selection));
}

export function loadTestSelection(): TestSelection {
  const saved = localStorage.getItem(TEST_SELECTION_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    ping: true,
    jitter: true,
    download: true,
    upload: true,
  };
}

// ============================================
// ACHIEVEMENTS
// ============================================

export function getAchievements(): Achievements {
  const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    hasRunPing: false,
    hasRunJitter: false,
    hasRunDownload: false,
    hasRunUpload: false,
    hasRunFullTest: false,
  };
}

export function saveAchievements(achievements: Achievements) {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
}

export function updateAchievement(type: "ping" | "jitter" | "download" | "upload" | "full") {
  const achievements = getAchievements();
  switch (type) {
    case "ping":
      achievements.hasRunPing = true;
      break;
    case "jitter":
      achievements.hasRunJitter = true;
      break;
    case "download":
      achievements.hasRunDownload = true;
      break;
    case "upload":
      achievements.hasRunUpload = true;
      break;
    case "full":
      achievements.hasRunFullTest = true;
      break;
  }
  saveAchievements(achievements);
  return achievements;
}

export function clearHistory() {
  localStorage.setItem(KEY, JSON.stringify([]));
  console.log("History cleared");
}