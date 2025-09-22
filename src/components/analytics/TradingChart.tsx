import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  ComposedChart,
  Bar,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Maximize2, Minimize2, Activity, CandlestickChart, LineChart as LineChartIcon, TrendingDown, TrendingUp } from 'lucide-react';
import EnhancedDateFilter, { DateFilter } from './EnhancedDateFilter';

interface TradingChartProps {
  data: Array<{
    date: string;
    revenue: number;
    sales: number;
  }>;
  formatXOF: (amount: number) => string;
  currentFilter?: DateFilter;
  onFilterChange?: (filter: DateFilter) => void;
}

const TradingChart: React.FC<TradingChartProps> = ({ data, formatXOF, currentFilter, onFilterChange }) => {
  // Chart mode & fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mode, setMode] = useState<'line' | 'candles'>('line');
  const { lockToLandscape, unlock } = useScreenOrientation();

  // Gérer l'orientation d'écran selon le mode plein écran
  useEffect(() => {
    if (isFullscreen) {
      lockToLandscape();
    } else {
      unlock();
    }

    // Cleanup quand le composant se démonte
    return () => {
      if (isFullscreen) {
        unlock();
      }
    };
  }, [isFullscreen, lockToLandscape, unlock]);

  // Moving averages
  const calculateMovingAverage = (values: number[], window: number) =>
    values.map((_, idx) => (idx < window - 1 ? null : values.slice(idx - window + 1, idx + 1).reduce((s, v) => s + v, 0) / window));

  const revenues = useMemo(() => data.map((d) => d.revenue), [data]);
  const ma7 = useMemo(() => calculateMovingAverage(revenues, Math.min(7, Math.max(1, revenues.length))), [revenues]);
  const ma21 = useMemo(() => calculateMovingAverage(revenues, Math.min(21, Math.max(1, revenues.length))), [revenues]);

  // Support/Resistance bands
  const { support, resistance } = useMemo(() => {
    if (!revenues.length) return { support: 0, resistance: 0 };
    const sorted = [...revenues].sort((a, b) => a - b);
    const s = sorted[Math.floor(sorted.length * 0.25)];
    const r = sorted[Math.floor(sorted.length * 0.75)];
    return { support: s, resistance: r };
  }, [revenues]);

  // Enriched data for tooltip and MA lines
  const enrichedData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        ma7: ma7[index],
        ma21: ma21[index],
        isBreakout: item.revenue > resistance || item.revenue < support,
        change:
          index === 0
            ? 0
            : item.revenue - (data[index - 1]?.revenue ?? item.revenue),
      })),
    [data, ma7, ma21, support, resistance]
  );

  // Trend detection
  const trend: 'bullish' | 'bearish' | 'neutral' = useMemo(() => {
    if (data.length < 5) return 'neutral';
    const recent = data.slice(-5);
    const slope = (recent[4].revenue - recent[0].revenue) / 4;
    if (slope > 0) return 'bullish';
    if (slope < 0) return 'bearish';
    return 'neutral';
  }, [data]);

  // Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">CA:</span><span className="font-medium text-primary">{formatXOF(d.revenue)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Ventes:</span><span className="font-medium text-green-600">{d.sales}</span></div>
            {d.ma7 && (
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">MA7:</span><span className="font-medium text-purple-600">{formatXOF(d.ma7)}</span></div>
            )}
            {d.ma21 && (
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">MA21:</span><span className="font-medium text-amber-600">{formatXOF(d.ma21)}</span></div>
            )}
            {d.change !== undefined && (
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Δ jour:</span><span className={d.change >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{formatXOF(Math.abs(d.change))} {d.change >= 0 ? '↑' : '↓'}</span></div>
            )}
            {d.isBreakout && <div className="text-orange-600 font-medium">Breakout détecté</div>}
          </div>
        </div>
      );
    }
    return null;
  };

  const ChartControls = (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as any)}>
        <ToggleGroupItem value="line" aria-label="Ligne">
          <LineChartIcon className="w-4 h-4 mr-1" /> Ligne
        </ToggleGroupItem>
        <ToggleGroupItem value="candles" aria-label="Bougies">
          <CandlestickChart className="w-4 h-4 mr-1" /> Bougies
        </ToggleGroupItem>
      </ToggleGroup>
      {!isFullscreen ? (
        <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
          <Maximize2 className="w-4 h-4 mr-1" /> Plein écran
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
          <Minimize2 className="w-4 h-4 mr-1" /> Fermer
        </Button>
      )}
    </div>
  );

  const ChartLegend = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
      <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-primary"></div><span>CA (prix)</span></div>
      <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-purple-500"></div><span>MA7</span></div>
      <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-amber-500"></div><span>MA21</span></div>
      <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-green-500"></div><span>Support/Résistance</span></div>
    </div>
  );

  const LineModeChart = (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={enrichedData} margin={{ top: 10, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />

        <ReferenceArea y1={resistance * 0.96} y2={resistance * 1.04} fill="#ef4444" fillOpacity={0.08} />
        <ReferenceArea y1={support * 0.96} y2={support * 1.04} fill="#22c55e" fillOpacity={0.08} />

        <ReferenceLine y={resistance} stroke="#ef4444" strokeDasharray="8 4" strokeWidth={2} />
        <ReferenceLine y={support} stroke="#22c55e" strokeDasharray="8 4" strokeWidth={2} />

        <Line type="monotone" dataKey="ma7" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="5 5" name="MA7" />
        <Line type="monotone" dataKey="ma21" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="3 3" name="MA21" />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--primary))', r: 3, strokeWidth: 2, stroke: 'white' }}
          activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'white' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const CandleModeChart = (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={enrichedData} margin={{ top: 10, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />

        <ReferenceArea y1={resistance * 0.96} y2={resistance * 1.04} fill="#ef4444" fillOpacity={0.08} />
        <ReferenceArea y1={support * 0.96} y2={support * 1.04} fill="#22c55e" fillOpacity={0.08} />
        <ReferenceLine y={resistance} stroke="#ef4444" strokeDasharray="8 4" strokeWidth={2} />
        <ReferenceLine y={support} stroke="#22c55e" strokeDasharray="8 4" strokeWidth={2} />

        {/* "Bougies" simplifiées via des barres colorées selon la variation */}
        <Bar dataKey="revenue" barSize={10} radius={[2, 2, 0, 0]}>
          {enrichedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#16a34a' : '#ef4444'} />
          ))}
        </Bar>
        {/* MA lines au-dessus des bougies */}
        <Line type="monotone" dataKey="ma7" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="5 5" name="MA7" />
        <Line type="monotone" dataKey="ma21" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="3 3" name="MA21" />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const Header = (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Analyse Technique des Ventes
        {trend === 'bullish' && (
          <span className="ml-2 inline-flex items-center text-green-600 text-sm"><TrendingUp className="w-4 h-4 mr-1" />Haussier</span>
        )}
        {trend === 'bearish' && (
          <span className="ml-2 inline-flex items-center text-red-600 text-sm"><TrendingDown className="w-4 h-4 mr-1" />Baissier</span>
        )}
      </h3>
      {ChartControls}
    </div>
  );

  return (
    <>
      <Card className="p-6">
        {Header}
        <div className="h-80">
          {mode === 'line' ? LineModeChart : CandleModeChart}
        </div>
        {ChartLegend}
      </Card>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="max-w-screen-2xl mx-auto h-full flex flex-col p-4 gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">Analyse Technique - Plein écran</span>
                <Badge variant="secondary" className="text-xs hidden md:flex">
                  📱 Mode paysage sur mobile
                </Badge>
              </div>
              {ChartControls}
            </div>

            {/* Filtres visibles en mode plein écran */}
            {currentFilter && onFilterChange && (
              <EnhancedDateFilter currentFilter={currentFilter} onFilterChange={onFilterChange} />
            )}

            <div className="flex-1 min-h-0">
              <div className="h-full rounded-lg border bg-card">
                {mode === 'line' ? (
                  <div className="h-full">{LineModeChart}</div>
                ) : (
                  <div className="h-full">{CandleModeChart}</div>
                )}
              </div>
            </div>

            {ChartLegend}
          </div>
        </div>
      )}
    </>
  );
};

export default TradingChart;
