import fontStacks from "@readium/css/css/vars/fontStacks.json";

import { createDefinitionFromStaticFonts, createDefinitionsFromGoogleFonts } from "../helpers";
import { I18nValue } from "./i18n";

export interface SystemFontSource {
  type: "system";
}

export interface BunnyFontSource {
  type: "custom";
  provider: "bunny";
}

export interface GoogleFontSource {
  type: "custom";
  provider: "google";
}

export interface LocalStaticFontFile {
  path: string;
  weight: number;
  style: "normal" | "italic";
}

export interface LocalVariableFontFile {
  path: string;
  style?: "normal" | "italic";
}

export interface LocalStaticFontSource {
  type: "custom";
  provider: "local";
  variant: "static";
  files: LocalStaticFontFile[];
}

export interface LocalVariableFontSource {
  type: "custom";
  provider: "local";
  variant: "variable";
  files: LocalVariableFontFile[];
}

export type LocalFontSource = LocalStaticFontSource | LocalVariableFontSource;

export type FontSource = SystemFontSource | BunnyFontSource | GoogleFontSource | LocalFontSource;

export type VariableFontRangeConfig = {
  min: number;
  max: number;
  step?: number;
};

export type WeightConfig =
  | {
      type: "static";
      values: number[];
    }
  | {
      type: "variable";
    } & VariableFontRangeConfig;

export interface FontSpec {
  family: string;
  fallbacks: string[];
  weights: WeightConfig;
  styles?: ("normal" | "italic")[];
  widths?: VariableFontRangeConfig;
  display?: "swap" | "block" | "fallback" | "optional";
}

export interface FontDefinition {
  id: string;
  name: string;
  label?: I18nValue<string>;
  source: FontSource;
  spec: FontSpec;
}

export type FontCollection = Record<string, FontDefinition>;

export type ValidatedLanguageCollection = {
  fonts: FontCollection; 
  supportedLanguages: string[] 
};

export type ThFontFamilyPref = {
  default: FontCollection;
} | {
  [K in Exclude<string, "default">]: ValidatedLanguageCollection;
};

export const readiumCSSFontCollection: FontCollection = {
  oldStyle: {
    id: "oldStyle",
    name: "Old Style",
    label: "reader.preferences.fontFamily.oldStyle.descriptive",
    source: { type: "system" },
    spec: {
      family: fontStacks.RS__oldStyleTf,
      weights: { type: "static", values: [400, 700] },
      fallbacks: []
    }
  },
  modern: {
    id: "modern",
    name: "Modern",
    label: "reader.preferences.fontFamily.modern.descriptive",
    source: { type: "system" },
    spec: {
      family: fontStacks.RS__modernTf,
      weights: { type: "static", values: [400, 700] },
      fallbacks: []
    }
  },
  sans: {
    id: "sans",
    name: "Sans",
    label: "reader.preferences.fontFamily.sans",
    source: { type: "system" },
    spec: {
      family: fontStacks.RS__sansTf,
      weights: { type: "static", values: [400, 700] },
      fallbacks: []
    }
  },
  humanist: {
    id: "humanist",
    name: "Humanist",
    label: "reader.preferences.fontFamily.humanist.descriptive",
    source: { type: "system" },
    spec: {
      family: fontStacks.RS__humanistTf,
      weights: { type: "static", values: [400, 700] },
      fallbacks: []
    }
  },
  monospace: {
    id: "monospace",
    name: "Monospace",
    label: "reader.preferences.fontFamily.monospace",
    source: { type: "system" },
    spec: {
      family: fontStacks.RS__monospaceTf,
      weights: { type: "static", values: [400, 700] },
      fallbacks: []
    }
  }
};

export const defaultFontCollection: FontCollection = {
  "system-sans": {
    id: "system-sans",
    name: "系统无衬线字体",
    source: { type: "system" },
    spec: {
      family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fallbacks: [],
      weights: { type: "variable", min: 100, max: 900, step: 100 },
      styles: ["normal", "italic"]
    }
  },
  "system-serif": {
    id: "system-serif",
    name: "系统衬线字体",
    source: { type: "system" },
    spec: {
      family: "'Times New Roman', Georgia, serif",
      fallbacks: [],
      weights: { type: "static", values: [400, 700] },
      styles: ["normal", "italic"]
    }
  },
  "MiSans": {
    id: "MiSans",
    name: "MiSans",
    source: {
      type: "custom",
      provider: "local",
      variant: "static",
      files: [
        { path: "/fonts/MiSans/MiSans-Regular.woff2", weight: 400, style: "normal" },
        { path: "/fonts/MiSans/MiSans-Bold.woff2", weight: 700, style: "normal" }
      ]
    },
    spec: {
      family: "MiSans",
      fallbacks: ["sans-serif"],
      weights: { type: "static", values: [400, 700] },
      styles: ["normal"]
    }
  }
};

export const tamilCollection = {
  ...createDefinitionsFromGoogleFonts({
    cssUrl: "https://fonts.googleapis.com/css2?family=Anek+Tamil:wght@100..800&family=Catamaran:wght@100..900&family=Hind+Madurai:wght@400;700&family=Mukta+Malar:wght@400;700&family=Noto+Sans+Tamil:wght@100..900&family=Noto+Serif+Tamil:ital,wght@0,100..900;1,100..900",
    options: {
      order: ["noto-sans-tamil", "noto-serif-tamil", "anek-tamil", "catamaran", "hind-madurai", "mukta-malar"],
      labels: {
        "noto-sans-tamil": "Noto Sans",
        "noto-serif-tamil": "Noto Serif",
        "anek-tamil": "அனேக் தமிழ்",
        "catamaran": "கட்டுமரன்",
        "mukta-malar": "முக்த மலர்"
      },
      fallbacks: {
        "noto-serif-tamil": ["serif"]
      }
    }
  })
}