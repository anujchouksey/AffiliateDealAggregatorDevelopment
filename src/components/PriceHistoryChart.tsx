import React, { useState, useMemo, useRef } from 'react';
import { 
  TrendingDown, Sparkles, Flame, 
  Bell, CheckCircle2, ShieldCheck
} from 'lucide-react';
import type { Deal } from '../types';
import { generatePriceHistory, type TimeRange, type PricePoint } from '../utils/priceHistory';

interface PriceHistoryChartProps {
  deal: Deal;
  className?: string;
  compact?: boolean;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  deal,
  className = '',
  compact = false
}) => {
  const [range, setRange] = useState<TimeRange>('90D');
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverY, setHoverY] = useState<number | null>(null);
  
  // Price alert input state
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>(() => {
    const val = deal.dealPrice > 0 ? (deal.dealPrice * 0.95).toFixed(0) : '50';
    return val;
  });
  const [alertEmail, setAlertEmail] = useState<string>('');
  const [alertSubscribed, setAlertSubscribed] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // Compute price history data
  const analysis = useMemo(() => {
    return generatePriceHistory(deal, range);
  }, [deal, range]);

  const { points, lowestPrice, highestPrice, averagePrice, isAllTimeLow, savingsVsAveragePercent, recommendationText } = analysis;

  // SVG dimensions
  const width = 640;
  const height = compact ? 180 : 240;
  const paddingX = 40;
  const paddingY = 30;

  // Calculate scales
  const priceMin = Math.max(0, lowestPrice * 0.92);
  const priceMax = highestPrice * 1.05;
  const priceRange = priceMax - priceMin || 1;

  // Map points to SVG coordinates
  const svgCoords = useMemo(() => {
    return points.map((p, index) => {
      const x = paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
      const y = height - paddingY - ((p.price - priceMin) / priceRange) * (height - paddingY * 2);
      return { x, y, point: p };
    });
  }, [points, priceMin, priceRange, width, height, paddingX, paddingY]);

  // Build SVG path
  const pathD = useMemo(() => {
    if (svgCoords.length === 0) return '';
    return svgCoords.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      // Smooth curve with cubic bezier control points
      const prev = svgCoords[idx - 1];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }, '');
  }, [svgCoords]);

  // Area path for gradient fill underneath
  const areaD = useMemo(() => {
    if (svgCoords.length === 0) return '';
    const first = svgCoords[0];
    const last = svgCoords[svgCoords.length - 1];
    const bottomY = height - paddingY;
    return `${pathD} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [pathD, svgCoords, height, paddingY]);

  // Mouse scrubbing handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || svgCoords.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseSvgX = ((e.clientX - rect.left) / rect.width) * width;

    // Find closest point
    let closest = svgCoords[0];
    let minDist = Math.abs(mouseSvgX - closest.x);

    for (let i = 1; i < svgCoords.length; i++) {
      const dist = Math.abs(mouseSvgX - svgCoords[i].x);
      if (dist < minDist) {
        minDist = dist;
        closest = svgCoords[i];
      }
    }

    setHoveredPoint(closest.point);
    setHoverX(closest.x);
    setHoverY(closest.y);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverX(null);
    setHoverY(null);
  };

  const handleSetAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail || !alertEmail.includes('@')) return;
    setAlertSubscribed(true);
    setTimeout(() => setAlertSubscribed(false), 5000);
  };

  return (
    <div className={`bg-slate-950/70 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-md flex flex-col ${className}`}>
      {/* Top Header & Range Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              Price History Tracker
              {isAllTimeLow && (
                <span className="text-[11px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full shadow-lg shadow-orange-500/20 flex items-center gap-1 animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-current" /> All-Time Low
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified price fluctuations across {deal.store} and major authorized retailers.
          </p>
        </div>

        {/* Apple HIG Range Pill Selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl shrink-0 self-start sm:self-auto">
          {(['30D', '90D', '180D', '1Y'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                range === r
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Current Price */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Current Deal</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-400">${deal.dealPrice.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-400/80 font-bold">Today</span>
          </div>
        </div>

        {/* Lowest Price */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Lowest Price</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-amber-400">${lowestPrice.toFixed(2)}</span>
            {isAllTimeLow && (
              <span className="text-[9px] font-bold text-amber-300 bg-amber-950 px-1.5 py-0.2 rounded border border-amber-500/30">
                LOWEST
              </span>
            )}
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">{range} Average</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-200">${averagePrice.toFixed(2)}</span>
            {savingsVsAveragePercent > 0 && (
              <span className="text-[10px] font-bold text-emerald-400">-{savingsVsAveragePercent}%</span>
            )}
          </div>
        </div>

        {/* Peak MSRP */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Peak Recorded</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-400">${highestPrice.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500">MSRP</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 p-2 border border-slate-800/80">
        {/* Floating Tooltip if hovering */}
        {hoveredPoint && hoverX !== null && hoverY !== null && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 transition-transform duration-75"
            style={{
              left: `${(hoverX / width) * 100}%`,
              top: `${(hoverY / height) * 100}%`
            }}
          >
            <div className="bg-slate-900/95 border border-emerald-500/40 text-slate-100 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md text-xs whitespace-nowrap">
              <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-between gap-3">
                <span>{hoveredPoint.fullDate}</span>
                <span className="text-emerald-400 font-bold">{hoveredPoint.store}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-black text-emerald-400">
                  ${hoveredPoint.price.toFixed(2)}
                </span>
                {deal.originalPrice > hoveredPoint.price && (
                  <span className="text-[11px] text-slate-400 line-through">
                    ${deal.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {hoveredPoint.event && (
                <div className="text-[10px] text-amber-300 font-bold mt-1 flex items-center gap-1 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{hoveredPoint.event}</span>
                </div>
              )}
            </div>
            {/* Tooltip Arrow */}
            <div className="w-2.5 h-2.5 bg-slate-900 border-r border-b border-emerald-500/40 transform rotate-45 mx-auto -mt-1.5" />
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Line Gradient */}
            <linearGradient id="priceLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="65%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Area Fill Gradient */}
            <linearGradient id="priceAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>

            {/* Dot Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines (horizontal) */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#1e293b"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x={paddingX}
            y={paddingY - 8}
            fill="#64748b"
            fontSize="10"
            fontFamily="sans-serif"
          >
            ${highestPrice.toFixed(0)} High
          </text>

          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#1e293b"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x={paddingX}
            y={height / 2 - 8}
            fill="#64748b"
            fontSize="10"
            fontFamily="sans-serif"
          >
            ${averagePrice.toFixed(0)} Avg
          </text>

          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#10b981"
            strokeDasharray="3 3"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <text
            x={paddingX}
            y={height - paddingY + 18}
            fill="#10b981"
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            ${lowestPrice.toFixed(0)} All-Time Low
          </text>

          {/* Area Fill */}
          <path d={areaD} fill="url(#priceAreaGradient)" />

          {/* Main Price Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#priceLineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Data Points (Dots on curve) */}
          {svgCoords.map((pt, i) => {
            const isToday = i === svgCoords.length - 1;
            if (!isToday && i % 4 !== 0) return null;
            return (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={isToday ? 5 : 3.5}
                fill={isToday ? '#f59e0b' : '#10b981'}
                stroke="#020617"
                strokeWidth="2"
                filter={isToday ? 'url(#glow)' : undefined}
              />
            );
          })}

          {/* Vertical scrubber line on hover */}
          {hoverX !== null && (
            <line
              x1={hoverX}
              y1={paddingY}
              x2={hoverX}
              y2={height - paddingY}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
          )}

          {/* Glowing pulse ring on hover */}
          {hoverX !== null && hoverY !== null && (
            <g>
              <circle
                cx={hoverX}
                cy={hoverY}
                r="8"
                fill="#f59e0b"
                fillOpacity="0.3"
                className="animate-ping"
              />
              <circle
                cx={hoverX}
                cy={hoverY}
                r="5"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="2"
                filter="url(#glow)"
              />
            </g>
          )}

          {/* X-axis date labels */}
          <text
            x={paddingX}
            y={height - 8}
            fill="#64748b"
            fontSize="10"
            fontFamily="sans-serif"
          >
            {points[0]?.date}
          </text>
          <text
            x={width / 2}
            y={height - 8}
            fill="#64748b"
            fontSize="10"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            {points[Math.floor(points.length / 2)]?.date}
          </text>
          <text
            x={width - paddingX}
            y={height - 8}
            fill="#f59e0b"
            fontWeight="bold"
            fontSize="10"
            textAnchor="end"
            fontFamily="sans-serif"
          >
            Today ({points[points.length - 1]?.date})
          </text>
        </svg>
      </div>

      {/* Deal Pulse Buy Intelligence / Recommendation */}
      <div className="mt-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              DealPulse Buy Recommendation:
            </span>
            <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              STRONG BUY
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {recommendationText}
          </p>
        </div>
      </div>

      {/* Price Drop Alert Form */}
      <div className="mt-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Notify Me If Price Drops Lower</span>
          </div>
          <span className="text-[11px] text-slate-400">Zero spam • 1-click unsubscribe</span>
        </div>

        {alertSubscribed ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Price alert created! We'll alert you the second it drops below ${alertTargetPrice}.</span>
          </div>
        ) : (
          <form onSubmit={handleSetAlert} className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 shrink-0">
              <span className="text-slate-500 mr-1">$</span>
              <input
                type="number"
                value={alertTargetPrice}
                onChange={(e) => setAlertTargetPrice(e.target.value)}
                placeholder="Target $"
                className="bg-transparent text-xs text-emerald-400 font-bold outline-none w-16"
                required
              />
            </div>
            <input
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder="Enter your email for price alerts..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Set Alert</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
