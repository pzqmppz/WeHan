/**
 * Cloudflare Workers Proxy for WeHan API
 * 优化版本 - 添加超时控制和更好的错误处理
 */

const TARGET_API = 'https://wehan.vercel.app/api/open';
const API_KEY = 'wehan_open_api_key_2026';
const TIMEOUT_MS = 30000; // 30秒超时

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

      // 获取请求体（非 GET 请求）
      let body = null;
      if (request.method !== 'GET') {
        try {
          body = await request.text();
        } catch (e) {
          // 忽略读取 body 的错误
        }
      }

      // 创建带超时的请求
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        // 转发请求
        const targetRequest = new Request(targetUrl, {
          method: request.method,
          headers: {
            'Content-Type': request.headers.get('Content-Type') || 'application/json',
            'X-API-Key': API_KEY,
            'User-Agent': 'WeHan-Cloudflare-Proxy/1.0',
            'Accept': 'application/json',
          },
          body: body,
          signal: controller.signal,
        });

        const response = await fetch(targetRequest);
        clearTimeout(timeoutId);

        // 获取响应体
        const responseBody = await response.text();

        // 返回响应，添加 CORS 头
        return new Response(responseBody, {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
          },
        });

      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          return new Response(JSON.stringify({
            success: false,
            error: '请求超时，请稍后重试'
          }), {
            status: 504,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        throw fetchError;
      }

    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: '代理服务错误: ' + (error.message || '未知错误')
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
