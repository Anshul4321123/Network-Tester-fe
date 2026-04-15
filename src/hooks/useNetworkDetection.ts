// hooks/useNetworkDetection.ts
import { useEffect, useState } from "react";
import { detectISP, type ISPInfo as ISPInfoType } from "../utils/ispDetector";

export function useNetworkDetection() {
  const [ispInfo, setIspInfo] = useState<ISPInfoType | null>(null);
  const [ispLoading, setIspLoading] = useState(true);
  const [previousIp, setPreviousIp] = useState<string>("");
  const [originalIspName, setOriginalIspName] = useState<string>("");

  const refreshISPInfo = async () => {
    console.log("🔄 Refreshing ISP info...");
    localStorage.removeItem("cached_isp_info");
    const info = await detectISP();
    if (info) {
      console.log("✅ ISP info refreshed:", info.isp);
      setIspInfo(info);
      setPreviousIp(info.ip || "");
      setOriginalIspName(info.isp || "");
      localStorage.setItem("cached_isp_info", JSON.stringify({ ...info, timestamp: Date.now() }));
    }
  };

  useEffect(() => {
    const loadISP = async () => {
      setIspLoading(true);
      localStorage.removeItem("cached_isp_info");
      const info = await detectISP();
      if (info) {
        setIspInfo(info);
        setPreviousIp(info.ip || "");
        setOriginalIspName(info.isp || "");
        localStorage.setItem("cached_isp_info", JSON.stringify({ ...info, timestamp: Date.now() }));
      }
      setIspLoading(false);
    };
    loadISP();
  }, []);

  useEffect(() => {
    const checkNetworkChange = async () => {
      const currentIp = ispInfo?.ip;
      if (currentIp && previousIp && currentIp !== previousIp) {
        console.log("🌐 Network changed! IP changed from", previousIp, "to", currentIp);
        localStorage.removeItem("cached_isp_info");
        await refreshISPInfo();
      }
      if (currentIp) {
        setPreviousIp(currentIp);
      }
    };
    checkNetworkChange();
  }, [ispInfo?.ip]);

  return { ispInfo, ispLoading, originalIspName, refreshISPInfo };
}