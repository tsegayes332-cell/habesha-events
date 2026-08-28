const ethMonthsEn = [
  'Meskerem',
  'Tikimt',
  'Hidar',
  'Tahsas',
  'Tir',
  'Yekatit',
  'Megabit',
  'Miazia',
  'Ginbot',
  'Sene',
  'Hamle',
  'Nehase',
  'Pagume',
];

const ethMonthsAm = [
  'ሚስከረም',
  'ጥቅምት',
  'ኅዳር',
  'ታሕሳስ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጉሜ',
];

export const isGregorianLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

export const getEthiopianNewYear = (gregorianYear) => {
  const newYearDay = isGregorianLeapYear(gregorianYear + 1) ? 12 : 11;
  return Date.UTC(gregorianYear, 8, newYearDay);
};

const parseDate = (value) => {
  if (value instanceof Date) return value;
  return new Date(value);
};

export const getEthiopianDate = (date = new Date()) => {
  const parsedDate = parseDate(date);
  const utcDay = Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());

  let ethYear;
  let yearStartUtc;
  const currentEthNewYear = getEthiopianNewYear(parsedDate.getFullYear());

  if (utcDay >= currentEthNewYear) {
    ethYear = parsedDate.getFullYear() - 7;
    yearStartUtc = currentEthNewYear;
  } else {
    ethYear = parsedDate.getFullYear() - 8;
    yearStartUtc = getEthiopianNewYear(parsedDate.getFullYear() - 1);
  }

  const dayOffset = Math.floor((utcDay - yearStartUtc) / 86400000);
  const monthIndex = Math.floor(dayOffset / 30);
  const day = (dayOffset % 30) + 1;

  return {
    day,
    monthIndex,
    year: ethYear,
  };
};

export const getEthiopianMonthName = (monthIndex, locale = 'en') => {
  if (locale?.startsWith('am')) {
    return ethMonthsAm[monthIndex] || ethMonthsAm[0];
  }
  return ethMonthsEn[monthIndex] || ethMonthsEn[0];
};

export const formatEthiopianDate = (date = new Date(), locale = 'en') => {
  const ethDate = getEthiopianDate(date);
  const monthName = getEthiopianMonthName(ethDate.monthIndex, locale);

  if (locale?.startsWith('am')) {
    return `${ethDate.day} ${monthName} ${ethDate.year} ዓ.ም.`;
  }

  return `${monthName} ${ethDate.day}, ${ethDate.year} EC`;
};

export const formatEthiopianDateShort = (date = new Date(), locale = 'en') => {
  const ethDate = getEthiopianDate(date);
  const monthName = getEthiopianMonthName(ethDate.monthIndex, locale);

  if (locale?.startsWith('am')) {
    return `${ethDate.day} ${monthName}`;
  }

  return `${monthName} ${ethDate.day}`;
};

export const formatEthiopianTime = (date = new Date(), locale = 'en') => {
  const parsedDate = parseDate(date);
  const intlLocale = locale?.startsWith('am') ? 'am-ET' : 'en-US';
  return new Intl.DateTimeFormat(intlLocale, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: !locale?.startsWith('am'),
  }).format(parsedDate);
};
