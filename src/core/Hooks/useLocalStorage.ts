"use client";

import { useEffect, useRef, useState } from "react";

export const useLocalStorage = (key: string) => {
  const [localData, setLocalData] = useState<any>(null);
  const cachedLocalData = useRef<any>(null);

  const setValue = (newValue: any) => {
    setLocalData(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  const getValue = () => {
    if (localData !== null) return localData;
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  };

  const clearValue = () => {
    setLocalData(null);
    localStorage.removeItem(key);
  };

  useEffect(() => {
    cachedLocalData.current = localData;
  }, [localData])

  return {
    setLocalData: setValue,
    getLocalData: getValue,
    clearLocalData: clearValue,
    localData,
    cachedLocalData
  };
};