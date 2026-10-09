/**
 * Money is stored as INTEGER minor units (paisa/cents) to avoid floating point drift.
 * The API accepts and returns major units (e.g. 1250.50).
 */
export const toMinor = (value) => Math.round(Number(value) * 100);
export const fromMinor = (minor) => Math.round(Number(minor) || 0) / 100;

export const hasValidPrecision = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;
};

/** Mongoose toJSON options for documents that carry an `amount` in minor units. */
export const moneyToJSON = {
  transform: (doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    if (typeof ret.amount === 'number') ret.amount = fromMinor(ret.amount);
    return ret;
  },
};
