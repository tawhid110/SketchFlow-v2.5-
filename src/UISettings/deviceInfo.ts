import { useState, useEffect } from 'react';

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768; // Common mobile breakpoint
      setDeviceInfo({
        isMobile,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      });
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
}
