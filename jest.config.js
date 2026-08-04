const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Path to the Next.js app, so next/jest can load next.config.js and .env files.
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Unit tests live under src/; the top-level tests/ directory is Playwright
  // E2E specs (a different runner/config) and must not be picked up here.
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
}

// createJestConfig is exported this way to ensure next/jest can load the Next.js config, which is async
const nextJestConfig = createJestConfig(customJestConfig)

// next/jest builds its own transformIgnorePatterns (for its font packages, etc.) and
// that replaces ours rather than merging, so patch it back in after resolution.
// lucide-react ships ESM-only and needs to go through the transform instead of
// being left as-is like the rest of node_modules.
module.exports = async () => {
  const resolved = await nextJestConfig()
  resolved.transformIgnorePatterns = ['/node_modules/(?!(lucide-react)/)']
  return resolved
}
