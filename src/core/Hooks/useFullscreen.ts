"use client";

import { useCallback, useEffect, useState } from "react";
import { useIsClient } from "./useIsClient";

export const useFullscreen = (onChange?: (isFullscreen: boolean) => void) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isClient = useIsClient();

  const handleFullscreen = useCallback(() => {
    if (!isClient) return;

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, [isClient]);

  useEffect(() => {
    const onFSchange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      onChange && onChange(isFs);
    }
    document.addEventListener("fullscreenchange", onFSchange);

    return () => {
      document.removeEventListener("fullscreenchange", onFSchange);
    }
  }, [onChange]);

  return {
    isFullscreen,
    handleFullscreen
  }
}