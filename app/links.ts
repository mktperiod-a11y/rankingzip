export const SUGGEST_FORM = "https://docs.google.com/forms/d/e/1FAIpQLScs2OwjKDtQ-5T9ULWVx7BIHZCaXW-EkbcanhpjV918grUHmg/viewform";
export const suggestWith = (q: string) => `${SUGGEST_FORM}?usp=pp_url&entry.607032444=${encodeURIComponent(q)}`;
