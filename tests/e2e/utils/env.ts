import path from 'node:path';
import dotenv from 'dotenv';

// Resolve .env from the project root, regardless of the cwd Playwright
// was launched from (e.g. VS Code may use the workspace root, which can
// be a parent of this package).
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  baseURL: required('BASE_URL', 'https://automationexercise.com'),
  apiBaseURL: required('API_BASE_URL', 'https://automationexercise.com/api'),
  user: {
    email: required('TEST_USER_EMAIL'),
    password: required('TEST_USER_PASSWORD'),
    name: required('TEST_USER_NAME', 'NanLabs QA'),
  },
} as const;

export const STORAGE_STATE_PATH = 'tests/e2e/.auth/user.json';
