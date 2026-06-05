import { logger } from "./logger.js";

function parseBool(value) {
  return String(value || "").toLowerCase() === "true";
}

export function shouldForceMockRecipes() {
  return parseBool(process.env.USE_MOCK_DATA) || parseBool(process.env.USE_MOCK_RECIPES);
}

export function isRecipeApiFallbackError(error) {
  const status = error?.response?.status;
  return (
    status === 402 ||
    status === 429 ||
    status >= 500 ||
    error?.code === "ECONNABORTED" ||
    error?.code === "ENOTFOUND"
  );
}

export function logRecipeFallback(error, target) {
  logger.warn(`Recipe API fallback activated for ${target}`, {
    status: error?.response?.status,
    message: error?.message,
  });
}
