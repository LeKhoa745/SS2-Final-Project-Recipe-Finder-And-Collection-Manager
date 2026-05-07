import axios from 'axios';
import NodeCache from 'node-cache';
import { logger } from './logger.js';

export const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const SPOONACULAR_KEYS = (process.env.SPOONACULAR_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
let currentKeyIndex = 0;

// ─── Spoonacular Client ───────────────────────────────────────
export const spoonacularClient = axios.create({
  baseURL: process.env.SPOONACULAR_BASE_URL,
  timeout: 10000,
});

// Update the key for the current request
spoonacularClient.interceptors.request.use((config) => {
  if (SPOONACULAR_KEYS.length > 0) {
    config.params = config.params || {};
    config.params.apiKey = SPOONACULAR_KEYS[currentKeyIndex];
  }
  return config;
});

// ─── NewsAPI Client ───────────────────────────────────────────
export const newsClient = axios.create({
  baseURL: process.env.NEWS_API_BASE_URL,
  timeout: 8000,
  params:  { apiKey: process.env.NEWS_API_KEY },
});

// ─── Retry & Rotation interceptor (shared) ──────────────────────────────
function addRetryInterceptor(client, name) {
  client.interceptors.response.use(
    (res) => res,
    async (err) => {
      const config = err.config;
      config._retryCount = config._retryCount || 0;

      // Handle 402 (Payment Required) or 429 (Rate Limit) by rotating keys if it's Spoonacular
      if (name === 'Spoonacular' && (err.response?.status === 402 || err.response?.status === 429)) {
        if (currentKeyIndex < SPOONACULAR_KEYS.length - 1) {
          currentKeyIndex++;
          logger.warn(`[${name}] API Key exhausted. Switching to key #${currentKeyIndex + 1}`);
          config.params.apiKey = SPOONACULAR_KEYS[currentKeyIndex];
          return client(config);
        } else {
          logger.error(`[${name}] All API keys exhausted.`);
        }
      }

      // Retry on 5xx
      const shouldRetry =
        config._retryCount < 2 && (err.response?.status >= 500);

      if (shouldRetry) {
        config._retryCount++;
        const delay = Math.pow(2, config._retryCount) * 1000;
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
    logger.debug(`Cache HIT (In-Memory): ${cacheKey}`);
    return hit;
  }
  
  const { data } = await client.get(url, { params });
  cache.set(cacheKey, data, ttl);
  logger.debug(`Cache SET (In-Memory): ${cacheKey} (TTL ${ttl}s)`);
  return data;
}
