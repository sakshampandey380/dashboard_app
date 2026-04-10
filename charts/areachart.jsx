import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSelector } from "react-redux";
import { CHART_COLORS } from "../units/constants";
import { formatCurrency } from "../units/formatters";

const AreaChartCard = ({ data }) => {
  const theme = useSelector((state) => state.theme.mode);
  const palette = CHART_COLORS[theme];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsAreaChart data={data}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={palette[0]} stopOpacity={0.45} />
            <stop offset="95%" stopColor={palette[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
        <XAxis dataKey="month" stroke={theme === "dark" ? "#94a3b8" : "#64748b"} />
        <YAxis stroke={theme === "dark" ? "#94a3b8" : "#64748b"} />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "none",
            background: theme === "dark" ? "#0f172a" : "#ffffff",
          }}
          formatter={(value) => formatCurrency(value)}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={palette[0]}
          fill="url(#revenueFill)"
          strokeWidth={3}
          isAnimationActive
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartCard;
