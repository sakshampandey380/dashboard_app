import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSelector } from "react-redux";
import { CHART_COLORS } from "../units/constants";

const BarChartCard = ({ data }) => {
  const theme = useSelector((state) => state.theme.mode);
  const palette = CHART_COLORS[theme];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
        <XAxis dataKey="category" stroke={theme === "dark" ? "#94a3b8" : "#64748b"} />
        <YAxis stroke={theme === "dark" ? "#94a3b8" : "#64748b"} />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "none",
            background: theme === "dark" ? "#0f172a" : "#ffffff",
          }}
        />
        <Legend />
        <Bar dataKey="value" radius={[12, 12, 0, 0]} isAnimationActive>
          {data.map((entry, index) => (
            <Cell key={entry.category} fill={palette[index % palette.length]} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChartCard;
