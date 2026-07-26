export function format_indian_currency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  if (amount < 0) {
    return `-${format_indian_currency(Math.abs(amount))}`;
  }
  if (amount < 100000) {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  } else if (amount < 10000000) {
    const lakhs = amount / 100000.0;
    return `₹${lakhs.toFixed(2)} Lakhs`;
  } else {
    const crores = amount / 10000000.0;
    return `₹${crores.toFixed(2)} Crores`;
  }
}

export function get_real_world_equivalent_note(realPower, year, postTaxAmount) {
  const formattedPostTax = format_indian_currency(postTaxAmount);
  const formattedPower = format_indian_currency(realPower);

  let equivalent = "";
  if (realPower < 100000) {
    equivalent = "high-end tech equipment or 3 months of emergency reserves";
  } else if (realPower < 1000000) {
    equivalent = "1 year of full living expenses or a new electric vehicle";
  } else if (realPower < 5000000) {
    equivalent = "3 years of full living expenses or down payment for a prime property";
  } else if (realPower < 15000000) {
    equivalent = "a premium 2BHK apartment or 8 years of full financial freedom";
  } else if (realPower < 50000000) {
    equivalent = "luxury real estate acquisition or 15+ years of full financial independence";
  } else {
    equivalent = "generational wealth portfolio, commercial real estate asset, or permanent financial independence";
  }

  return `In today's 2026 money, your post-tax ${formattedPostTax} in ${year} buys what ${formattedPower} buys today (e.g., ${equivalent}).`;
}
