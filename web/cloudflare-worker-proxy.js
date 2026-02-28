/**
 * Cloudflare Workers Proxy for WeHan API
 * 将此代码部署到 Cloudflare Workers，作为 Coze 和 Vercel 之间的代理
 *
 * 部署地址: https://wehan-proxy.your-subdomain.workers.dev
 */

const TARGET_API = 'https://wehan.vercel.app/api/open';
const API_KEY = 'wehan_open_api_key_2026';

export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        },
      });
    }

    try {
      // 构建目标 URL
      const url = new URL(request.url);
      const targetUrl = TARGET_API + url.pathname + url.search;

      // 转发请求
      const targetRequest = new Request(targetUrl, {
        method: request.method,
        headers: {
          'Content-Type': request.headers.get('Content-Type') || 'application/json',
          'X-API-Key': API_KEY,
          'User-Agent': 'WeHan-Cloudflare-Proxy/1.0',
        },
        body: request.method !== 'GET' ? await request.text() : null,
      });

      const response = await fetch(targetRequest);

      // 返回响应，添加 CORS 头
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      };

      const newResponse = new Response(response.body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          ...corsHeaders,
        },
      });

      return newResponse;

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: '代理服务错误: ' + error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
