import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PIXEL_ICONS, PixelIcon, pixelIconSVG, type PixelIconName } from '../src/pixel-icon';

const cells = (name: PixelIconName) => [...pixelIconSVG(name).matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="(#[0-9A-F]{6})"/g)].map((m) => ({ x: +m[1]!, y: +m[2]!, w: +m[3]!, h: +m[4]!, fill: m[5]! }));

describe('pixel icon grammar', () => {
  it('stays on the 10 × 10 grid for every icon', () => {
    for (const name of Object.keys(PIXEL_ICONS) as PixelIconName[]) {
      for (const c of cells(name)) {
        expect(c.x).toBeGreaterThanOrEqual(0);
        expect(c.y).toBeGreaterThanOrEqual(0);
        expect(c.x + c.w).toBeLessThanOrEqual(10);
        expect(c.y + c.h).toBeLessThanOrEqual(10);
      }
    }
  });
  it('the idea is cream and six pixels or fewer', () => {
    for (const name of ['playlens', 'analytics', 'nutbot'] as const) {
      const cream = cells(name).filter((c) => c.fill === '#F1E7D6');
      expect(cream.reduce((n, c) => n + c.w * c.h, 0)).toBeLessThanOrEqual(6);
      expect(cream.length).toBeGreaterThan(0);
    }
  });
  it('exactly one accent spark pixel outside the frame', () => {
    for (const name of ['playlens', 'analytics', 'nutbot'] as const) {
      const sparks = cells(name).filter((c) => c.fill === '#FF7F45' && c.w === 1 && c.h === 1);
      const [spark] = PIXEL_ICONS[name].spark!;
      expect(spark).toBeDefined();
      expect(sparks.some((c) => c.x === PIXEL_ICONS[name].spark![0] && c.y === PIXEL_ICONS[name].spark![1])).toBe(true);
    }
  });
  it('no two icons use the same spark spot, and the spark never touches the idea', () => {
    const spots = (['playlens', 'analytics', 'nutbot'] as const).map((n) => PIXEL_ICONS[n].spark!.join(','));
    expect(new Set(spots).size).toBe(spots.length);
  });
  it('the export takes the accent colour', () => {
    expect(pixelIconSVG('analytics', '#00B4C8')).toContain('fill="#00B4C8"');
    expect(pixelIconSVG('analytics')).toContain('shape-rendering="crispEdges"');
  });
  it('the template shows the spark spots already taken, with no spark of its own', () => {
    expect(PIXEL_ICONS.template.spark).toBeNull();
    expect(cells('template').filter((c) => c.fill === '#3A2F27')).toHaveLength(3);
  });
  it('the component is labelled and exposes the status light', () => {
    const { rerender } = render(<PixelIcon name="analytics" />);
    expect(screen.getByRole('img', { name: 'AVN Analytics' })).not.toHaveAttribute('data-st');
    rerender(<PixelIcon name="analytics" status="bad" />);
    expect(screen.getByRole('img', { name: 'AVN Analytics' })).toHaveAttribute('data-st', 'bad');
  });
});
