import {
  CartesianGrid,
  Dot,
  Line,
  LineChart as RechartsLineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CHART_COLORS } from "../units/constants";

const LineChartCard = ({ data }) => {
  const theme = useSelector((state) => state.theme.mode);
  const palette = CHART_COLORS[theme];

  const average = useMemo(() => {
    if (!data?.length) return 0;
    return data.reduce((sum, item) => sum + item.value, 0) / data.length;
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
        <XAxis dataKey="month" stroke={theme === "dark" ? "#94a3b8" : "#64748b"} />
        <YAxis stroke={theme === "dark" ? "#94a3b8" : "#64748b"} />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "none",
            background: theme === "dark" ? "#0f172a" : "#ffffff",
          }}
        />
        <ReferenceLine
          y={average}
          stroke={palette[3]}
          strokeDasharray="4 4"
          label="Average"
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={palette[2]}
          strokeWidth={3}
          isAnimationActive
          dot={<Dot r={4} fill={palette[2]} strokeWidth={2} />}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChartCard;
