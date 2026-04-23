import path from 'node:path';
import dotenv from 'dotenv';

// Resolve .env from the project root, regardless of the cwd Playwright
// was launched from (e.g. VS Code may use the workspace root, which can
// be a parent of this package).
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

function required(name: string, fallback?: string): string {
  // Use || instead of ?? so that empty strings passed by CI (unset secrets)
  // also fall through to the fallback / error path.
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  baseURL: required('BASE_URL', 'https://automationexercise.com'),
  apiBaseURL: required('API_BASE_URL', 'https://automationexercise.com/api'),
  // Lazy getter: credentials are only resolved when first accessed (inside a
  // running test), NOT at module-import time. This prevents a collection-time
  // crash when the env vars are absent (e.g. CI without secrets configured).
  get user() {
    return {
      email: required('TEST_USER_EMAIL'),
      password: required('TEST_USER_PASSWORD'),
      name: required('TEST_USER_NAME', 'NanLabs QA'),
    };
  },
};

export const STORAGE_STATE_PATH = 'tests/e2e/.auth/user.json';
