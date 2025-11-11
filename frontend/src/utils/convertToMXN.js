// utils/convertToMXN.js
const exchangeRates = {
  USD: 18.5, // 1 USD = 18.5 MXN
  EUR: 20.3, // 1 EUR = 20.3 MXN
  MXN: 1,    // MXN se mantiene igual
};

export const convertToMXN = (amount, currency) => {
  if (!amount) return 0;
  const rate = exchangeRates[currency] || 1; // fallback a 1 si no existe
  return parseFloat(amount) * rate;
};