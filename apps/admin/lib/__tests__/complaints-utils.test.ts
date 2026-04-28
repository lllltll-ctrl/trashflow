import { describe, expect, it } from 'vitest';
import { extractCoords, statusToLabel, statusToVariant } from '../complaints-utils';

describe('statusToLabel', () => {
  it('translates each known status to Ukrainian', () => {
    expect(statusToLabel('new')).toBe('Нова');
    expect(statusToLabel('assigned')).toBe('Призначено');
    expect(statusToLabel('in_progress')).toBe('У роботі');
    expect(statusToLabel('resolved')).toBe('Вирішено');
    expect(statusToLabel('rejected')).toBe('Відхилено');
  });
});

describe('statusToVariant', () => {
  it('maps new to destructive (highest urgency)', () => {
    expect(statusToVariant('new')).toBe('destructive');
  });

  it('maps in-flight statuses to warning', () => {
    expect(statusToVariant('assigned')).toBe('warning');
    expect(statusToVariant('in_progress')).toBe('warning');
  });

  it('maps resolved to success', () => {
    expect(statusToVariant('resolved')).toBe('success');
  });

  it('maps rejected to neutral secondary', () => {
    expect(statusToVariant('rejected')).toBe('secondary');
  });
});

describe('extractCoords', () => {
  it('extracts [lat, lng] from a valid GeoJSON Point', () => {
    expect(
      extractCoords({ type: 'Point', coordinates: [32.3874, 50.5942] }),
    ).toEqual({ lat: 50.5942, lng: 32.3874 });
  });

  it('returns nulls for null input', () => {
    expect(extractCoords(null)).toEqual({ lat: null, lng: null });
    expect(extractCoords(undefined)).toEqual({ lat: null, lng: null });
  });

  it('returns nulls for non-Point geometries', () => {
    expect(
      extractCoords({ type: 'LineString' as 'Point', coordinates: [0, 0] }),
    ).toEqual({ lat: null, lng: null });
  });

  it('returns nulls when coordinates array is the wrong length', () => {
    expect(
      extractCoords({ type: 'Point', coordinates: [0] as unknown as [number, number] }),
    ).toEqual({ lat: null, lng: null });
  });

  it('returns nulls when coordinates contain non-numbers', () => {
    expect(
      extractCoords({
        type: 'Point',
        coordinates: ['abc', 50] as unknown as [number, number],
      }),
    ).toEqual({ lat: null, lng: null });
  });

  it('rejects out-of-range latitude', () => {
    expect(extractCoords({ type: 'Point', coordinates: [0, 91] })).toEqual({
      lat: null,
      lng: null,
    });
    expect(extractCoords({ type: 'Point', coordinates: [0, -91] })).toEqual({
      lat: null,
      lng: null,
    });
  });

  it('rejects out-of-range longitude', () => {
    expect(extractCoords({ type: 'Point', coordinates: [181, 0] })).toEqual({
      lat: null,
      lng: null,
    });
  });

  it('accepts boundary coordinates exactly at ±90 / ±180', () => {
    expect(extractCoords({ type: 'Point', coordinates: [180, 90] })).toEqual({
      lat: 90,
      lng: 180,
    });
    expect(extractCoords({ type: 'Point', coordinates: [-180, -90] })).toEqual({
      lat: -90,
      lng: -180,
    });
  });
});
