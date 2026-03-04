import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 768, 1024, 1440],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // 实验性功能
  experimental: {
    // 优化包导入，减少 Bundle 大小
    optimizePackageImports: ['@ant-design/icons', '@ant-design/x', 'antd', 'uuid'],
  },

  // 生产环境 Source Map（关闭以减小包体积）
  productionBrowserSourceMaps: false,

  // 压缩配置
  compress: true,

  // 生成 ETags
  generateEtags: true,

  // powered-by 头
  poweredByHeader: false,
}

// Bundle 分析（仅在 ANALYZE=true 时启用）
let exportedConfig = nextConfig

if (process.env.ANALYZE === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  })
  exportedConfig = withBundleAnalyzer(nextConfig)
}

export default exportedConfig
