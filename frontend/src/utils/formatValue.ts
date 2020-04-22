const formatValue = (value: number): string =>
  Intl.NumberFormat('pt_BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export default formatValue;
