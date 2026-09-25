/**
 * BizLedger POS - Formatting & Locale Utilities
 * Formats currency (PKR), Pakistani dates (DD-MM-YYYY), and numbers.
 */

export const formatPKR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'PKR 0';
  }
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(amount));

  return `PKR ${formatted}`;
};

export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-PK').format(value);
};

export const formatDatePK = (dateStrOrTimestamp: string | number | Date): string => {
  try {
    const d = new Date(dateStrOrTimestamp);
    if (isNaN(d.getTime())) return String(dateStrOrTimestamp);
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(dateStrOrTimestamp);
  }
};

export const formatDateTimePK = (dateStrOrTimestamp: string | number | Date): string => {
  try {
    const d = new Date(dateStrOrTimestamp);
    if (isNaN(d.getTime())) return String(dateStrOrTimestamp);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const strHours = String(hours).padStart(2, '0');

    return `${day}-${month}-${year} ${strHours}:${minutes} ${ampm}`;
  } catch {
    return String(dateStrOrTimestamp);
  }
};

export const getTodayPKString = (): string => {
  return formatDatePK(new Date());
};
