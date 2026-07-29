import type { NextConfig } from 'next';
import { linguiMacroSwcPlugin } from '@lingui/swc-plugin/options';

const nextConfig: NextConfig = {
  experimental: {
    swcPlugins: [linguiMacroSwcPlugin({}, { configPath: '../../packages/i18n/lingui.config.ts' })],
    useTypeScriptCli: true,
  },
};

export default nextConfig;
