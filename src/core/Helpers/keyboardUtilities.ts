"use client";

import { isMacish } from "./getPlatform";

export interface UnstableKey {
  [key: string]: string;
  longform: string;
  shortform: string;
}

export interface UnstableMetaKey extends UnstableKey {
  modifier: "altKey" | "ctrlKey" | "metaKey" | "shiftKey";
  symbol: "⌥" | "^" | "⌘" | "⊞" | "⇧";
}

export interface UnstablePlatformModifier extends UnstableKey {
  modifier: "ctrlKey" | "metaKey";
  symbol: "^" | "⌘";
}

export interface UnstableMetaKeys {
  [key: string]: UnstableMetaKey;
  altKey: UnstableMetaKey;
  ctrlKey: UnstableMetaKey;
  metaKey: UnstableMetaKey;
  shiftKey: UnstableMetaKey;
}

export enum UnstableShortcutMetaKeywords {
  alt = "altKey",
  ctrl = "ctrlKey",
  meta = "metaKey",
  platform = "platformKey",
  shift = "shiftKey"
}

export enum UnstableShortcutRepresentation {
  symbol = "symbol",
  short = "shortform",
  long = "longform"
};

export interface UnstableShortcut {
  className?: string;
  rawForm: string;
  representation?: UnstableShortcutRepresentation; 
  joiner?: string;
}

export interface UnstablePShortcut {
  key?: string;
  char?: string;
  modifiers: {
    [key: string]: boolean;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    platformKey: boolean;
    shiftKey: boolean;
  }
}

const altModifier: UnstableMetaKey = {
  longform: "Option",
  shortform: "Alt",
  modifier: "altKey",
  symbol: "⌥"
}

const ctrlModifier: UnstableMetaKey & UnstablePlatformModifier = {
  longform: "Control",
  shortform: "Ctrl",
  modifier: "ctrlKey",
  symbol: "^"
}

const metaModifierMac: UnstableMetaKey & UnstablePlatformModifier = {
  longform: "Command",
  shortform: "Cmd",
  modifier: "metaKey",
  symbol: "⌘"   
}

const metaModifierWin: UnstableMetaKey = {
  longform: "Windows",
  shortform: "Win",
  modifier: "metaKey",
  symbol: "⊞"
}

const shiftModifier: UnstableMetaKey = {
  longform: "Shift",
  shortform: "Shift",
  modifier: "shiftKey",
  symbol: "⇧"
}

export const metaKeys: UnstableMetaKeys = {
  altKey: altModifier,
  ctrlKey: ctrlModifier,
  metaKey: isMacish() ? metaModifierMac : metaModifierWin,
  shiftKey: shiftModifier
}

// Platform modifier differs from Mac to Windows so we have to get it dynamically

export const defaultPlatformModifier = ctrlModifier;

export const getPlatformModifier = (): UnstablePlatformModifier => {
  if (isMacish()) {
    return metaModifierMac;
  } else {
    return ctrlModifier;
  }
}

export const buildShortcut = (str: string) => {
  let shortcutObj: UnstablePShortcut = {
    key: "",
    char: "",
    modifiers: {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      platformKey: false,
      shiftKey: false
    }
  }
  
  const shortcutArray = str.split(/\s*?[+-]\s*?/);

  shortcutArray.filter((val) => {
    if ((Object.values(UnstableShortcutMetaKeywords) as string[]).includes(val)) {
      const trimmedKey = val.trim();
      shortcutObj.modifiers[trimmedKey] = true;
    } else {
      shortcutObj.char = val.trim().toUpperCase();
      shortcutObj.key = `Key${ val.trim().toUpperCase() }`;
    }
  });

  return shortcutObj.key ? shortcutObj : null;
}