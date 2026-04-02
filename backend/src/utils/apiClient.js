import axios from 'axios';
import NodeCache from 'node-cache';
import { logger } from './logger.js';

export const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// ─── Spoonacular Client ───────────────────────────────────────
export const spoonacularClient = axios.create({
  baseURL: process.env.SPOONACULAR_BASE_URL,
  timeout: 10000,
  params:  { apiKey: process.env.SPOONACULAR_API_KEY },
});

// ─── NewsAPI Client ───────────────────────────────────────────
export const newsClient = axios.create({
  baseURL: process.env.NEWS_API_BASE_URL,
  timeout: 8000,
  params:  { apiKey: process.env.NEWS_API_KEY },
});

// ─── Retry interceptor (shared) ──────────────────────────────
function addRetryInterceptor(client, name) {
  client.interceptors.response.use(
    (res) => res,
    async (err) => {
      const config = err.config;

      // If no config (e.g. cancelled request), just reject
      if (!config) return Promise.reject(err);

      config._retryCount = config._retryCount || 0;

      // Retry on 429 (rate limit) and 5xx
      const shouldRetry =
        config._retryCount < 3 &&
        (err.response?.status === 429 || err.response?.status >= 500);

      if (shouldRetry) {
        config._retryCount++;
        const delay = Math.pow(2, config._retryCount) * 1000; // 2s, 4s, 8s
        logger.warn(`[${name}] Retry ${config._retryCount} after ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        return client(config);
      }

      return Promise.reject(err);
    }
  );
}

addRetryInterceptor(spoonacularClient, 'Spoonacular');
addRetryInterceptor(newsClient, 'NewsAPI');

// ─── Cached GET helper ───────────────────────────────────────
export async function cachedGet(client, url, params = {}, ttl = 600) {
  const cacheKey = `${url}:${JSON.stringify(params)}`;
  const hit = cache.get(cacheKey);
  if (hit) {
    logger.debug(`Cache HIT: ${cacheKey}`);
    return hit;
  }
  const { data } = await client.get(url, { params });
  cache.set(cacheKey, data, ttl);
  logger.debug(`Cache SET: ${cacheKey} (TTL ${ttl}s)`);
  return data;
}
