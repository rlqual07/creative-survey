/**
 * Balanced Latin squares (Williams designs) for counterbalancing stimulus order.
 *
 * Why not a plain rotation? A cyclic rotation (1234, 2341, 3412, 4123) balances
 * which stimulus appears in each position, but stimulus 2 always immediately
 * follows stimulus 1, so any carryover effect is identical for every
 * participant and cannot be separated from the stimulus itself.
 *
 * A Williams design balances first-order carryover as well: each stimulus
 * immediately follows every other stimulus equally often.
 *
 * For even n, n sequences suffice.
 * For odd n, full carryover balance requires 2n sequences (the square plus its
 * mirror), so that is what this returns.
 *
 * Sequences are returned as arrays of 0-based positions into the survey's
 * ordered block list.
 */

const buildSquare = (n) => {
  // First row: 1, 2, n, 3, n-1, 4, n-2, ...
  const first = [1];
  let lo = 2;
  let hi = n;
  for (let k = 1; k < n; k++) {
    if (k % 2 === 1) {
      first.push(lo++);
    } else {
      first.push(hi--);
    }
  }

  // Each subsequent row shifts every element by one, modulo n.
  const rows = [];
  for (let i = 0; i < n; i++) {
    rows.push(first.map((v) => ((v - 1 + i) % n) + 1));
  }
  return rows;
};

const generateSequences = (n) => {
  if (n <= 0) return [];
  if (n === 1) return [[0]];
  if (n === 2) {
    return [
      [0, 1],
      [1, 0],
    ];
  }

  const rows = buildSquare(n);

  // Odd n needs the mirrored square for carryover balance.
  const all = n % 2 === 0 ? rows : rows.concat(rows.map((r) => [...r].reverse()));

  // Convert from 1-based labels to 0-based positions.
  return all.map((r) => r.map((v) => v - 1));
};

/**
 * Verify the balance properties of a generated set. Used by tests and
 * available for anyone auditing the design.
 */
const checkBalance = (sequences, n) => {
  const positionCounts = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const seq of sequences) {
    seq.forEach((stim, pos) => {
      positionCounts[stim][pos]++;
    });
  }
  const positionBalanced = positionCounts.every(
    (row) => new Set(row).size === 1
  );

  const carry = new Map();
  for (const seq of sequences) {
    for (let i = 1; i < seq.length; i++) {
      const key = `${seq[i - 1]}->${seq[i]}`;
      carry.set(key, (carry.get(key) || 0) + 1);
    }
  }
  const carryCounts = Array.from(carry.values());
  const carryBalanced =
    carryCounts.length > 0 && new Set(carryCounts).size === 1;

  const firstPositions = sequences.map((s) => s[0]).sort((a, b) => a - b);
  const everyStimulusStartsEqually =
    new Set(sequences.map((s) => s[0])).size === n;

  return {
    sequences: sequences.length,
    positionBalanced,
    carryBalanced,
    everyStimulusStartsEqually,
    firstPositions,
  };
};

module.exports = { generateSequences, checkBalance };
