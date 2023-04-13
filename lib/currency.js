const axios = require("axios");

async function convertToCurrency(amount, currency) {
  const options = {
    method: "GET",
    url: "https://currency-converter-by-api-ninjas.p.rapidapi.com/v1/convertcurrency",
    params: { have: "NGN", want: currency, amount },
    headers: {
      "X-RapidAPI-Key": "77e41e52c9mshba4868f77b733eap196358jsn5e427740ca50",
      "X-RapidAPI-Host": "currency-converter-by-api-ninjas.p.rapidapi.com",
    },
  };

  try {
    const res = axios.request(options);
    return res;
  } catch (error) {
    console.log(error);
    return { error: true, errorMessage: error.message };
  }
}

async function convertToCurrencies(amount) {
  const [usd, gbp] = await Promise.all([
    convertToCurrency(amount, "USD"),
    convertToCurrency(amount, "GBP"),
  ]);
  if (usd.error || gbp.error) {
    return { USD: null, GBP: null, error: true, errorMessage };
  }
  return { USD: usd.data.new_amount, GBP: gbp.data.new_amount, error: false };
}

module.exports = { convertToCurrency, convertToCurrencies };
