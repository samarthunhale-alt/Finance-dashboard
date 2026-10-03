import { COLORS } from '../../utils/constants.js';

export const axisProps = {
  tick: { fill: COLORS.axis, fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: COLORS.grid },
};

export const gridProps = { stroke: COLORS.grid, strokeDasharray: '3 3', vertical: false };

export function ChartFrame({ title, subtitle, children, height = 288, empty, emptyText = 'No data for this period yet.' }) {
  return (
    <section className="card p-5">
      <h3 className="font-semibold">{title}</h3>
      {subtitle && <p className="text-xs text-ink-soft">{subtitle}</p>}
      <div className="mt-4" style={{ height }}>
        {empty ? (
          <div className="flex h-full items-center justify-center rounded-lg bg-mist text-sm text-ink-soft">{emptyText}</div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
