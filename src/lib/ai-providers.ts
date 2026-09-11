export const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    keyPrefix: 'AIza',
    keyPlaceholder: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  anthropic: {
    name: 'Anthropic',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-api03-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  openai: {
    name: 'OpenAI',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
} as const

export type AIProviderKey = keyof typeof AI_PROVIDERS


export function isValidKeyFormat(provider: AIProviderKey, key: string): boolean {
  return key.startsWith(AI_PROVIDERS[provider].keyPrefix)
}
