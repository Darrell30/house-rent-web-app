import { describe, it, expect } from 'vitest';
import { formatIDR, formatDate, truncateText } from '../utils/formatters';

describe('formatters', () => {
  it('formats amount to IDR correctly', () => {
    const formatted = formatIDR(5000000);
    expect(formatted).toContain('5.000.000');
    expect(formatted).toContain('Rp');
  });

  it('handles invalid or zero amounts gracefully', () => {
    expect(formatIDR(0)).toContain('0');
    expect(formatIDR(null)).toBe('Rp 0');
    expect(formatIDR(undefined)).toBe('Rp 0');
  });

  it('formats dates cleanly', () => {
    const date = '2026-10-15T00:00:00.000Z';
    const formatted = formatDate(date);
    expect(formatted).toContain('2026');
  });

  it('truncates text with ellipsis', () => {
    const text = 'This is a long description that needs to be truncated';
    expect(truncateText(text, 10)).toBe('This is a ...');
    expect(truncateText('Short', 10)).toBe('Short');
  });
});
