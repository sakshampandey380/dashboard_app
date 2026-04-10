import { Cell, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useSelector } from "react-redux";
import { CHART_COLORS } from "../units/constants";

const PieChartCard = ({ data }) => {
  const theme = useSelector((state) => state.theme.mode);
  const palette = CHART_COLORS[theme];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="status"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={5}
          isAnimationActive
          label={({ status, percent }) =>
            `${status} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={entry.status} fill={palette[index % palette.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} (${((value / total) * 100).toFixed(0)}%)`, "Tasks"]} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChartCard;
