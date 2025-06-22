export function jsonStringify(obj) {
  return JSON.stringify(obj, removeCircularReferences(), 2);
}

function removeCircularReferences() {
  const seen = new WeakSet();
  return (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]'; // 또는 undefined
      }
      seen.add(value);
    }
    return typeof value === 'bigint' ? value.toString() : value;
  };
}
