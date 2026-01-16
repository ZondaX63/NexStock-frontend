/**
 * Format currency with dual display (original + TRY equivalent)
 * @param {number} price - The price amount
 * @param {string} currency - Currency code (USD, EUR, TRY)
 * @param {number} tryEquivalent - TRY equivalent amount (optional)
 * @returns {string} Formatted string like "€50.00 (≈ ₺1,850.00)"
 */
export const formatDualCurrency = (price, currency = 'TRY', tryEquivalent = null) => {
    if (!price) return '-';

    const formatted = price.toLocaleString('tr-TR', {
        style: 'currency',
        currency: currency
    });

    if (currency === 'TRY' || !tryEquivalent) {
        return formatted;
    }

    const tryFormatted = tryEquivalent.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    });

    return `${formatted} (≈ ${tryFormatted})`;
};

/**
 * Format price for display in product list
 * @param {object} product - Product object with salePrice, saleCurrency, finalPriceTRY
 * @returns {object} { primary, secondary } display strings
 */
export const formatProductPrice = (product) => {
    const currency = product.saleCurrency || product.currency || 'TRY';
    const price = product.salePrice || 0;
    const tryPrice = product.finalPriceTRY || price;

    const primary = price.toLocaleString('tr-TR', {
        style: 'currency',
        currency: currency
    });

    let secondary = null;
    if (currency !== 'TRY' && tryPrice) {
        secondary = `≈ ${tryPrice.toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        })}`;
    }

    return { primary, secondary };
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency) => {
    const symbols = {
        'TRY': '₺',
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };
    return symbols[currency] || currency;
};
