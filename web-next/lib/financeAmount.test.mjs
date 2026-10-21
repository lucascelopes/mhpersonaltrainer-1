import assert from 'node:assert/strict';
import test from 'node:test';
import { parseBrazilianMoneyInput } from './financeAmount.ts';

test('understands currency amounts entered by a Brazilian user', () => {
  assert.equal(parseBrazilianMoneyInput('R$ 1.200,00'), 1200);
  assert.equal(parseBrazilianMoneyInput('1.200'), 1200);
  assert.equal(parseBrazilianMoneyInput('1200,50'), 1200.5);
  assert.equal(parseBrazilianMoneyInput('1200.50'), 1200.5);
  assert.equal(parseBrazilianMoneyInput('0,01'), 0.01);
});

test('rejects empty and negative invoices', () => {
  assert.equal(parseBrazilianMoneyInput(''), 0);
  assert.equal(parseBrazilianMoneyInput('-10,00'), 0);
});
