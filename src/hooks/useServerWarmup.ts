// hooks/useServerWarmup.ts
import { useEffect, useState } from "react";

export function useServerWarmup() {
  const [serverWarmedUp, setServerWarmedUp] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/ping`, {
          signal: controller.signal,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setServerWarmedUp(true);
        } else {
          setTimeout(() => setServerWarmedUp(true), 3000);
        }
      } catch (error) {
        setTimeout(() => setServerWarmedUp(true), 4000);
      }
    };
    
    checkServer();
  }, []);

  return serverWarmedUp;
}