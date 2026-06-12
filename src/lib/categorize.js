function findCategory(categories, preferredNames) {
  const normalized = categories.map(c => ({ ...c, key: c.name.toLowerCase().trim() }));
  for (const name of preferredNames) {
    const exact = normalized.find(c => c.key === name);
    if (exact) return exact.id;
  }
  for (const name of preferredNames) {
    const partial = normalized.find(c => c.key.includes(name) || name.includes(c.key));
    if (partial) return partial.id;
  }
  return null;
}

export function merchantKey(note) {
  return (note || '')
    .toLowerCase()
    .replace(/upi\/|imps\/|neft\/|rtgs\/|ach\/|pos\/|ecom\//g, ' ')
    .replace(/[0-9a-f]{8,}/g, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/[^a-z ]+/g, ' ')
    .replace(/\b(ref|txn|upi|pay|payment|ltd|limited|pvt|private|india|bank)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 64);
}

export function categoryByMerchant(note, categories) {
  const key = merchantKey(note);
  const text = `${note || ''} ${key || ''}`.toLowerCase();
  const has = (words) => words.some(w => text.includes(w));

  if (has(['swiggy', 'zomato', 'zepto', 'blinkit', 'bigbasket', 'instamart', 'restaurant', 'cafe', 'coffee', 'grocery', 'groceries', 'milk', 'dairy']))
    return findCategory(categories, ['food', 'groceries', 'grocery', 'dining']);
  if (has(['tsrtc', 'irctc', 'redbus', 'ksrtc', 'apsrtc', 'uber', 'ola', 'rapido', 'metro', 'railway', 'train', 'bus', 'airline', 'flight', 'petrol', 'fuel', 'parking', 'toll']))
    return findCategory(categories, ['travel', 'transport']);
  if (has(['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'decathlon', 'croma', 'reliance digital']))
    return findCategory(categories, ['shopping']);
  if (has(['netflix', 'prime video', 'hotstar', 'spotify', 'bookmyshow', 'cinema', 'movie', 'gaming']))
    return findCategory(categories, ['entertainment']);
  if (has(['apollo', 'pharmeasy', 'netmeds', 'hospital', 'clinic', 'doctor', 'pharmacy', 'medical']))
    return findCategory(categories, ['health', 'medical']);
  if (has(['airtel', 'jio', 'vi ', 'vodafone', 'bsnl', 'bescom', 'electricity', 'broadband', 'internet', 'recharge', 'water bill', 'gas bill']))
    return findCategory(categories, ['utilities', 'utility', 'bills']);
  if (has(['rent', 'landlord', 'maintenance']))
    return findCategory(categories, ['rent']);
  if (has(['school', 'college', 'course', 'udemy', 'coursera', 'tuition', 'books']))
    return findCategory(categories, ['education']);
  return null;
}

export function categoryFromHistory(note, expenses) {
  if (!note || note.length < 3 || !expenses?.length) return null;
  const q = note.toLowerCase().trim();
  const matches = expenses.filter(e =>
    e.type !== 'income' && e.category_id && e.note?.toLowerCase().includes(q)
  );
  if (!matches.length) return null;
  const freq = {};
  for (const e of matches) freq[e.category_id] = (freq[e.category_id] || 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

export function autoCategory(note, categories, expenses) {
  if (!note || note.length < 3) return null;
  return categoryByMerchant(note, categories) || categoryFromHistory(note, expenses) || null;
}
