const { WebpayPlus } = require('transbank-sdk');

// Credenciales de prueba (integración)
const commerceCode = process.env.WEBPAY_COMMERCE_CODE || '597055555532';
const apiKey = process.env.WEBPAY_API_KEY || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
const environment = process.env.WEBPAY_ENVIRONMENT === 'PRODUCTION' ? 'Production' : 'Integration';

// Crear instancia de Transaction
let transaction;

if (environment === 'Production') {
  transaction = WebpayPlus.Transaction.buildForProduction(commerceCode, apiKey);
} else {
  transaction = WebpayPlus.Transaction.buildForIntegration(commerceCode, apiKey);
}

/**
 * Crea una transacción Webpay Plus
 * @param {string} buyOrder - Identificador único de la orden de compra
 * @param {string} sessionId - Identificador de sesión del usuario
 * @param {number} amount - Monto en pesos chilenos (entero)
 * @param {string} returnUrl - URL de retorno después del pago
 * @returns {Promise<{url: string, token: string}>}
 */
exports.createTransaction = async (buyOrder, sessionId, amount, returnUrl) => {
  // Webpay requiere el monto como número entero (sin decimales)
  const roundedAmount = Math.round(amount);
  
  console.log('🔵 Creando transacción Webpay:', {
    buyOrder,
    sessionId,
    amount: roundedAmount,
    returnUrl,
  });

  const response = await transaction.create(buyOrder, sessionId, roundedAmount, returnUrl);
  
  console.log('🟢 Transacción creada:', {
    url: response.url,
    token: response.token,
  });

  return {
    url: response.url,
    token: response.token,
  };
};

/**
 * Confirma una transacción Webpay Plus
 * @param {string} token - Token único de la transacción
 * @returns {Promise<{response_code: number, ...}>}
 */
exports.commitTransaction = async (token) => {
  console.log('🔵 Confirmando transacción:', token);
  
  const response = await transaction.commit(token);
  
  console.log('🟢 Transacción confirmada:', {
    response_code: response.response_code,
    amount: response.amount,
    buy_order: response.buy_order,
  });

  return response;
};

/**
 * Obtiene el estado de una transacción
 * @param {string} token - Token único de la transacción
 */
exports.getTransactionStatus = async (token) => {
  return await transaction.status(token);
};

/**
 * Reembolsa una transacción
 * @param {string} token - Token único de la transacción
 * @param {number} amount - Monto a reembolsar
 */
exports.refundTransaction = async (token, amount) => {
  return await transaction.refund(token, Math.round(amount));
};