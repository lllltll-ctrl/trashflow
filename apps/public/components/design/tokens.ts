import type { WasteCategoryId } from '@trashflow/db';

export const palette = {
  greenDeep: '#0E3A23',
  greenMid: '#185C38',
  greenSurf: '#1F7A4A',
  greenLight: '#2FA560',
  greenMint: '#6FD39A',
  greenPale: '#E8F5EC',
  greenPaper: '#F4F9F1',
  cream: '#FAF7EF',
  ink: '#07231A',
  inkSoft: '#2B3F33',
  inkMute: '#687A70',
  yellow: '#FFD23F',
  yellowSoft: '#FFE27A',
  yellowShadow: '#C79908',
} as const;

type CatStyle = {
  color: string;
  bg: string;
  glyph: string;
  ua: string;
  en: string;
};

export const categoryStyle: Record<WasteCategoryId, CatStyle> = {
  plastic: {
    color: 'var(--c-plastic)',
    bg: 'var(--c-plastic-bg)',
    glyph: '◌',
    ua: 'Пластик',
    en: 'Plastic',
  },
  glass: {
    color: 'var(--c-glass)',
    bg: 'var(--c-glass-bg)',
    glyph: '◇',
    ua: 'Скло',
    en: 'Glass',
  },
  paper: {
    color: 'var(--c-paper)',
    bg: 'var(--c-paper-bg)',
    glyph: '◱',
    ua: 'Папір',
    en: 'Paper',
  },
  metal: {
    color: 'var(--c-metal)',
    bg: 'var(--c-metal-bg)',
    glyph: '◐',
    ua: 'Метал',
    en: 'Metal',
  },
  hazardous: {
    color: 'var(--c-hazardous)',
    bg: 'var(--c-hazardous-bg)',
    glyph: '⚡',
    ua: 'Небезпечні',
    en: 'Hazard',
  },
};

export const darkHeroBackground = `
  radial-gradient(ellipse 120% 70% at 50% -10%, ${palette.greenLight} 0%, transparent 55%),
  radial-gradient(ellipse 80% 50% at 90% 110%, ${palette.yellow}2E 0%, transparent 60%),
  linear-gradient(180deg, ${palette.greenDeep} 0%, ${palette.greenMid} 65%, ${palette.greenDeep} 100%)
`;

export const paleHeroBackground = `linear-gradient(165deg, ${palette.greenPale} 0%, ${palette.greenPaper} 100%)`;
