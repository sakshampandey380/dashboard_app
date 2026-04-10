import { Download } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageWrapper from "../../components/layout/pagewrapper";
import Button from "../../components/common/button";
import AreaChartCard from "../../charts/areachart";
import BarChartCard from "../../charts/barchart";
import LineChartCard from "../../charts/linechart";
import PieChartCard from "../../charts/piechart";
import { DATE_RANGES } from "../../units/constants";
import { exportCsv } from "../../units/helpers";
import { fetchDashboardCharts, fetchDashboardSummary, setRange } from "../../features/dashboard/dashboardslice";

const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const { charts, summary, range } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchDashboardCharts(range));
  }, [dispatch, range]);

  const exportAnalytics = () => {
    const rows = [
      ...(charts?.monthlyRevenue || []).map((item) => ({
        chart: "Monthly revenue",
        label: item.month,
        value: item.value,
      })),
      ...(charts?.productsByCategory || []).map((item) => ({
        chart: "Products by category",
        label: item.category,
        value: item.value,
      })),
    ];

    exportCsv(rows, `analytics-${range}.csv`);
  };

  return (
    <PageWrapper
      title="Analytics"
      subtitle="Explore trends across revenue, product mix, task throughput, and user growth."
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            {DATE_RANGES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => dispatch(setRange(item.value))}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  range === item.value
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Button onClick={exportAnalytics}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold">Monthly revenue</h3>
            <span className="text-sm text-slate-500 dark:text-slate-300">
              Revenue total: {summary?.totalRevenue || 0}
            </span>
          </div>
          <AreaChartCard data={charts?.monthlyRevenue || []} />
        </div>
        <div className="card p-5">
          <h3 className="mb-3 font-display text-xl font-semibold">Products by category</h3>
          <BarChartCard data={charts?.productsByCategory || []} />
        </div>
        <div className="card p-5">
          <h3 className="mb-3 font-display text-xl font-semibold">User registrations</h3>
          <LineChartCard data={charts?.userRegistrations || []} />
        </div>
        <div className="card p-5 xl:col-span-2">
          <h3 className="mb-3 font-display text-xl font-semibold">Task status distribution</h3>
          <PieChartCard data={charts?.taskStatus || []} />
        </div>
      </div>
    </PageWrapper>
  );
};

export default AnalyticsPage;
