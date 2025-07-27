// Currency conversion service
// Note: In a real application, you would fetch these rates from an API like exchangerate-api.com

const exchangeRates = {
  INR: 1.00,      // Base currency
  USD: 0.012,     // 1 INR = 0.012 USD (approx)
  EUR: 0.011,     // 1 INR = 0.011 EUR (approx)
  GBP: 0.0095,    // 1 INR = 0.0095 GBP (approx)
  JPY: 1.78,      // 1 INR = 1.78 JPY (approx)
  CAD: 0.016,     // 1 INR = 0.016 CAD (approx)
  AUD: 0.018,     // 1 INR = 0.018 AUD (approx)
  CHF: 0.010,     // 1 INR = 0.010 CHF (approx)
  CNY: 0.086,     // 1 INR = 0.086 CNY (approx)
  SGD: 0.016,     // 1 INR = 0.016 SGD (approx)
  HKD: 0.094,     // 1 INR = 0.094 HKD (approx)
  NZD: 0.020,     // 1 INR = 0.020 NZD (approx)
  SEK: 0.13,      // 1 INR = 0.13 SEK (approx)
  NOK: 0.13,      // 1 INR = 0.13 NOK (approx)
  DKK: 0.084,     // 1 INR = 0.084 DKK (approx)
  PLN: 0.049,     // 1 INR = 0.049 PLN (approx)
  CZK: 0.28,      // 1 INR = 0.28 CZK (approx)
  HUF: 4.2,       // 1 INR = 4.2 HUF (approx)
  RUB: 1.1,       // 1 INR = 1.1 RUB (approx)
  BRL: 0.060      // 1 INR = 0.060 BRL (approx)
};

const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  SGD: 'S$',
  HKD: 'HK$',
  NZD: 'NZ$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RUB: '₽',
  BRL: 'R$'
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to INR first (base currency)
  const inINR = amount / exchangeRates[fromCurrency];
  // Then convert to target currency
  return inINR * exchangeRates[toCurrency];
};

export const formatCurrency = (amount, currency = 'INR') => {
  const symbol = currencySymbols[currency] || currency;
  
  // Format based on currency
  switch (currency) {
    case 'INR':
      return `${symbol}${amount.toLocaleString('en-IN', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      })}`;
    case 'USD':
    case 'CAD':
    case 'AUD':
    case 'SGD':
    case 'HKD':
    case 'NZD':
      return `${symbol}${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    case 'EUR':
    case 'GBP':
      return `${symbol}${amount.toLocaleString('en-GB', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    case 'JPY':
      return `${symbol}${amount.toLocaleString('ja-JP', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}`;
    default:
      return `${symbol}${amount.toLocaleString()}`;
  }
};

export const getExchangeRate = (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;
  return exchangeRates[toCurrency] / exchangeRates[fromCurrency];
};

export { currencySymbols }; 