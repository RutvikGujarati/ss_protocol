 const formatWithCommas = (value) => {
	if (value === null || value === undefined) return "";
	const valueString = value.toString();
	const [integerPart, decimalPart] = valueString.split(".");
	const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  export default {formatWithCommas}