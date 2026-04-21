import type { Config } from 'tailwindcss';
import { baseConfig } from '@trashflow/config/tailwind';

const config: Config = {
  ...baseConfig,
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
