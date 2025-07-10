export const MODEL_PRICING = {
  'claude-3-5-sonnet-20241022': {
    input: 3.00 / 1_000_000,
    output: 15.00 / 1_000_000,
    cache_read: 0.30 / 1_000_000,
    cache_write: 3.75 / 1_000_000
  },
  'claude-3-5-sonnet-20240620': {
    input: 3.00 / 1_000_000,
    output: 15.00 / 1_000_000,
    cache_read: 0.30 / 1_000_000,
    cache_write: 3.75 / 1_000_000
  },
  'claude-3-5-haiku-20241022': {
    input: 1.00 / 1_000_000,
    output: 5.00 / 1_000_000,
    cache_read: 0.10 / 1_000_000,
    cache_write: 1.25 / 1_000_000
  },
  'claude-3-opus-20240229': {
    input: 15.00 / 1_000_000,
    output: 75.00 / 1_000_000,
    cache_read: 1.50 / 1_000_000,
    cache_write: 18.75 / 1_000_000
  },
  'claude-3-haiku-20240307': {
    input: 0.25 / 1_000_000,
    output: 1.25 / 1_000_000,
    cache_read: 0.03 / 1_000_000,
    cache_write: 0.30 / 1_000_000
  },
  'claude-opus-4-20250514': {
    input: 15.00 / 1_000_000,
    output: 75.00 / 1_000_000,
    cache_read: 1.50 / 1_000_000,
    cache_write: 18.75 / 1_000_000
  },
  'claude-sonnet-4-20250514': {
    input: 3.00 / 1_000_000,
    output: 15.00 / 1_000_000,
    cache_read: 0.30 / 1_000_000,
    cache_write: 3.75 / 1_000_000
  },
  '<synthetic>': {
    input: 0,
    output: 0,
    cache_read: 0,
    cache_write: 0
  }
};

export const SUBSCRIPTION_PLANS = {
  'max': {
    name: 'Claude Max',
    monthly_cost: 100,
    limits: {
      daily: null,
      block: null
    }
  },
  'max_plus': {
    name: 'Claude Max Plus',
    monthly_cost: 200,
    limits: {
      daily: null,
      block: null
    }
  },
  'pro': {
    name: 'Claude Pro',
    monthly_cost: 20,
    limits: {
      daily: 50,
      block: 30
    }
  }
};

export function calculateCost(tokens, modelId) {
  const pricing = MODEL_PRICING[modelId];
  if (!pricing) {
    console.warn(`Unknown model: ${modelId}`);
    return 0;
  }

  const cost = 
    (tokens.input || 0) * pricing.input +
    (tokens.output || 0) * pricing.output +
    (tokens.cache_read || 0) * pricing.cache_read +
    (tokens.cache_write || 0) * pricing.cache_write;

  return cost;
}