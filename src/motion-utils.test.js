import test from 'node:test';
import assert from 'node:assert/strict';
import { dampMotion, getScrollProgress } from './motion-utils.js';

test('rapid cursor movement is damped instead of snapping to the target', () => {
  const next = dampMotion(0, 100, 5.2, 1 / 60);

  assert.ok(next > 0, 'cursor should begin moving toward the target');
  assert.ok(next < 10, 'cursor should travel only a small fraction of a sudden jump');
  assert.ok(next < 100, 'cursor must not snap directly to the target');
});

test('cursor damping never overshoots its target', () => {
  const forward = dampMotion(20, 80, 6, 1 / 60);
  const reverse = dampMotion(80, 20, 6, 1 / 60);

  assert.ok(forward > 20 && forward < 80);
  assert.ok(reverse < 80 && reverse > 20);
});

test('cursor damping caps long frame durations after a stalled frame', () => {
  const next = dampMotion(0, 100, 6, 5);

  assert.ok(next > 0);
  assert.ok(next < 20, 'a long frame must not cause a sudden full-screen jump');
});

test('zero-duration damping does not move the cursor', () => {
  assert.equal(dampMotion(10, 90, 6, 0), 10);
});

test('scroll progress reports the start, middle, and end correctly', () => {
  assert.equal(getScrollProgress(0, 1000, 3000), 0);
  assert.equal(getScrollProgress(1000, 1000, 3000), 0.5);
  assert.equal(getScrollProgress(2000, 1000, 3000), 1);
});

test('scroll progress stays within bounds during overscroll', () => {
  assert.equal(getScrollProgress(-100, 1000, 3000), 0);
  assert.equal(getScrollProgress(5000, 1000, 3000), 1);
});

test('a page that does not require scrolling has zero progress', () => {
  assert.equal(getScrollProgress(0, 1000, 1000), 0);
  assert.equal(getScrollProgress(0, 1200, 900), 0);
});
