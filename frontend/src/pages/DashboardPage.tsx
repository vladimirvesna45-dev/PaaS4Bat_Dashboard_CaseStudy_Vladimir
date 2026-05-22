import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileDown, GitCompare, Loader2, Upload } from 'lucide-react';
import { CapacityChart } from '@/components/charts/CapacityChart';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { BreakdownChart } from '@/components/dashboard/BreakdownChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/useAppStore';
import { buildExplanation } from '@/lib/explanation';
import { exportDashboardPdf, exportPredictionCsv } from '@/lib/export';

export function DashboardPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const { batteryLabel, predictionA, resetCompare } = useAppStore();

  if (!predictionA) {
    return (
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button onClick={() => navigate('/')}>
          <Upload className="h-4 w-4" />
          Go to Upload
        </Button>
      </div>
    );
  }

  const explanation = buildExplanation(predictionA, batteryLabel);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Battery</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {batteryLabel}
          </h2>
          <p className="text-xs text-slate-400">
            ID: {predictionA.prediction_id}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <Upload className="h-4 w-4" />
            Upload New
          </Button>
        </div>
      </div>

      <div id="dashboard-export" className="relative">
        <Card>
          <CardHeader>
            <CardTitle>Capacity Degradation Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <CapacityChart
              series={[
                {
                  label: batteryLabel,
                  curve: predictionA.capacity_curve,
                  color: '#2563eb',
                  showCi: true,
                },
              ]}
              cycleLife={predictionA.cycle_life}
            />
          </CardContent>
        </Card>

        <div className="mt-6">
          <MetricsCards prediction={predictionA} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <BreakdownChart breakdown={predictionA.degradation_breakdown} />
          <Card>
            <CardHeader>
              <CardTitle>Prediction Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {explanation}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
        <Button
          variant="secondary"
          onClick={() => exportPredictionCsv(predictionA, batteryLabel)}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button
          variant="secondary"
          disabled={exporting}
          onClick={async () => {
            setExporting(true);
            try {
              await exportDashboardPdf(
                'dashboard-export',
                `paas4bat_${batteryLabel}.pdf`,
              );
            } catch (err) {
              setError(
                err instanceof Error ? err.message : 'PDF export failed',
              );
            } finally {
              setExporting(false);
            }
          }}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          Export PDF
        </Button>
        <Button
          onClick={() => {
            resetCompare();
            navigate('/compare');
          }}
        >
          <GitCompare className="h-4 w-4" />
          Compare Another
        </Button>
      </div>
    </div>
  );
}
