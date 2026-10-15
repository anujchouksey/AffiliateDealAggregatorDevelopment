import React, { useState, useMemo, useRef } from 'react';
import { Bell, CheckCircle2, ShieldCheck } from 'lucide-react';
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
    return deal.dealPrice > 0 ? (deal.dealPrice * 0.95).toFixed(0) : '50';
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
  const height = compact ? 180 : 220;
  const paddingX = 36;
  const paddingY = 28;

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
    if (!alertEmail.trim()) return;
    setAlertSubscribed(true);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#f5f5f7] flex items-center gap-1.5">
              <span>Price Trend</span>
              {isAllTimeLow && (
                <span className="text-[10px] font-medium text-[#30d158] bg-[#30d158]/12 border border-[#30d158]/25 px-2 py-0.5 rounded-full">
                  All-Time Low
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-[#86868b] mt-0.5">
            Verified price history across {deal.store} and authorized retailers.
          </p>
        </div>

        {/* Apple Segmented Range Pills */}
        <div className="flex items-center bg-white/[0.06] border border-white/[0.08] p-1 rounded-full shrink-0 self-start sm:self-auto">
          {(['30D', '90D', '180D', '1Y'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                range === r
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-[#86868b] hover:text-[#f5f5f7]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="bg-[#121214] border border-white/[0.06] p-3 rounded-[16px]">
          <span className="text-[11px] text-[#86868b] block mb-0.5">Current Offer</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold text-[#f5f5f7]">${deal.dealPrice.toFixed(2)}</span>
            <span className="text-[10px] text-[#30d158] font-medium">Active</span>
          </div>
        </div>

        <div className="bg-[#121214] border border-white/[0.06] p-3 rounded-[16px]">
          <span className="text-[11px] text-[#86868b] block mb-0.5">Lowest Recorded</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold text-[#30d158]">${lowestPrice.toFixed(2)}</span>
            {isAllTimeLow && (
              <span className="text-[9px] font-medium text-[#30d158] bg-[#30d158]/12 px-1.5 py-0.2 rounded-full">
                Floor
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#121214] border border-white/[0.06] p-3 rounded-[16px]">
          <span className="text-[11px] text-[#86868b] block mb-0.5">{range} Average</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold text-[#f5f5f7]">${averagePrice.toFixed(2)}</span>
            {savingsVsAveragePercent > 0 && (
              <span className="text-[10px] text-[#30d158] font-medium">-{savingsVsAveragePercent}%</span>
            )}
          </div>
        </div>

        <div className="bg-[#121214] border border-white/[0.06] p-3 rounded-[16px]">
          <span className="text-[11px] text-[#86868b] block mb-0.5">Peak MSRP</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold text-[#86868b]">${highestPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Interactive Apple-Grade SVG Chart */}
      <div className="relative w-full overflow-hidden rounded-[20px] bg-[#0e0e10] p-2 border border-white/[0.06]">
        {/* Floating Tooltip */}
        {hoveredPoint && hoverX !== null && hoverY !== null && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 transition-transform duration-75"
            style={{
              left: `${(hoverX / width) * 100}%`,
              top: `${(hoverY / height) * 100}%`
            }}
          >
            <div className="bg-[#1c1c1e]/95 border border-white/[0.12] text-[#f5f5f7] px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md text-xs whitespace-nowrap">
              <div className="text-[10px] text-[#86868b] flex items-center justify-between gap-3">
                <span>{hoveredPoint.fullDate}</span>
                <span className="text-[#2997ff] font-medium">{hoveredPoint.store}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-sm font-semibold text-[#f5f5f7]">
                  ${hoveredPoint.price.toFixed(2)}
                </span>
                {deal.originalPrice > hoveredPoint.price && (
                  <span className="text-[10px] text-[#86868b] line-through">
                    ${deal.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {hoveredPoint.event && (
                <div className="text-[10px] text-[#30d158] font-medium mt-1">
                  {hoveredPoint.event}
                </div>
              )}
            </div>
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
            <linearGradient id="applePriceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#30d158" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#30d158" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <text
            x={paddingX}
            y={paddingY - 6}
            fill="#6e6e73"
            fontSize="9"
            fontFamily="sans-serif"
          >
            ${highestPrice.toFixed(0)} High
          </text>

          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <text
            x={paddingX}
            y={height / 2 - 6}
            fill="#6e6e73"
            fontSize="9"
            fontFamily="sans-serif"
          >
            ${averagePrice.toFixed(0)} Avg
          </text>

          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#30d158"
            strokeDasharray="2 2"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <text
            x={paddingX}
            y={height - paddingY + 16}
            fill="#30d158"
            fontSize="9"
            fontFamily="sans-serif"
          >
            ${lowestPrice.toFixed(0)} Floor
          </text>

          {/* Area Fill */}
          <path d={areaD} fill="url(#applePriceGradient)" />

          {/* Main Price Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#30d158"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Scrubbing indicator on hover */}
          {hoverX !== null && (
            <line
              x1={hoverX}
              y1={paddingY}
              x2={hoverX}
              y2={height - paddingY}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
          )}

          {hoverX !== null && hoverY !== null && (
            <circle
              cx={hoverX}
              cy={hoverY}
              r="4.5"
              fill="#30d158"
              stroke="#ffffff"
              strokeWidth="2"
            />
          )}

          {/* X-axis date labels */}
          <text
            x={paddingX}
            y={height - 6}
            fill="#6e6e73"
            fontSize="9"
            fontFamily="sans-serif"
          >
            {points[0]?.date}
          </text>
          <text
            x={width / 2}
            y={height - 6}
            fill="#6e6e73"
            fontSize="9"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            {points[Math.floor(points.length / 2)]?.date}
          </text>
          <text
            x={width - paddingX}
            y={height - 6}
            fill="#30d158"
            fontSize="9"
            textAnchor="end"
            fontFamily="sans-serif"
          >
            Today ({points[points.length - 1]?.date})
          </text>
        </svg>
      </div>

      {/* Apple Intelligence Recommendation */}
      <div className="mt-3.5 bg-white/[0.04] border border-white/[0.08] rounded-[18px] p-3.5 flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-[#30d158]/12 flex items-center justify-center text-[#30d158] shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f5f5f7]">
              Price Assessment:
            </span>
            <span className="text-[10px] font-medium text-[#30d158] bg-[#30d158]/12 px-2 py-0.5 rounded-full">
              Optimal Time to Buy
            </span>
          </div>
          <p className="text-xs text-[#86868b] mt-1 leading-relaxed">
            {recommendationText}
          </p>
        </div>
      </div>

      {/* Price Drop Alert Form */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-[#f5f5f7] font-medium">
            <Bell className="w-3.5 h-3.5 text-[#2997ff]" />
            <span>Notify me if price drops</span>
          </div>
          <span className="text-[10px] text-[#6e6e73]">Zero spam</span>
        </div>

        {alertSubscribed ? (
          <div className="bg-[#30d158]/10 border border-[#30d158]/20 rounded-full p-2.5 text-xs text-[#30d158] font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Alert active. We will notify you when price hits ${alertTargetPrice}.</span>
          </div>
        ) : (
          <form onSubmit={handleSetAlert} className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5 text-xs text-[#f5f5f7] shrink-0">
              <span className="text-[#86868b] mr-1">$</span>
              <input
                type="number"
                value={alertTargetPrice}
                onChange={(e) => setAlertTargetPrice(e.target.value)}
                placeholder="Target"
                className="bg-transparent text-xs text-[#30d158] font-medium outline-none w-16"
                required
              />
            </div>
            <input
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder="Enter email for price alerts..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-white/20 rounded-full px-3.5 py-1.5 text-xs text-[#f5f5f7] placeholder-[#86868b] outline-none transition-colors"
              required
            />
            <button
              type="submit"
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium px-4 py-1.5 rounded-full text-xs shadow-sm transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>Set Alert</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
