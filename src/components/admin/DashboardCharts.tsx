import {
  BarChart as MuiBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { Box, Typography, Paper, useTheme, useMediaQuery } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface MaterialBarChartProps {
  data: Array<{ label: string; value: number; growth?: number; [key: string]: string | number | undefined }>;
  title: string;
  subtitle?: string;
  height?: number;
  showGrid?: boolean;
  color?: string;
}

export const MaterialBarChart = ({
  data,
  title,
  subtitle,
  height = 300,
  showGrid = true,
  color = "#3b82f6",
}: MaterialBarChartProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
    ...item,
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { growth?: number } }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.95)" }}
        >
          <Typography variant="body2" fontWeight="bold" color="text.primary">
            {label}
          </Typography>
          <Typography variant="body2" color="primary.main">
            Active Users: {payload[0].value}
          </Typography>
          {payload[0].payload.growth !== undefined && (
            <Typography
              variant="body2"
              color={
                payload[0].payload.growth >= 0 ? "success.main" : "error.main"
              }
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              {payload[0].payload.growth >= 0 ? (
                <TrendingUpIcon fontSize="small" />
              ) : (
                <TrendingDownIcon fontSize="small" />
              )}
              {payload[0].payload.growth >= 0 ? "+" : ""}
              {payload[0].payload.growth}%
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ height: height }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="600" color="text.primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <ResponsiveContainer width="100%" height="100%">
        <MuiBarChart
          data={chartData}
          margin={{
            top: 20,
            right: isMobile ? 10 : 30,
            left: isMobile ? -10 : 0,
            bottom: 5,
          }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          )}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: isMobile ? 12 : 14 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: isMobile ? 12 : 14 }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            name="Active Users"
            radius={[4, 4, 0, 0]}
            maxBarSize={isMobile ? 30 : 60}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.growth && entry.growth > 0 ? theme.palette.success.main : color}
                opacity={entry.growth && entry.growth > 0 ? 0.9 : 0.7}
              />
            ))}
          </Bar>
        </MuiBarChart>
      </ResponsiveContainer>
    </Box>
  );
};

interface WeeklyActivityChartProps {
  data: Array<{ date: string; active_users: number; new_signups: number }>;
}

export const WeeklyActivityChart = ({ data }: WeeklyActivityChartProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const chartData = data.map((item) => ({
    name: item.date,
    activeUsers: item.active_users,
    newSignups: item.new_signups,
  }));

  return (
    <Box sx={{ height: 300 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="600" color="text.primary">
          Weekly User Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Daily active users and new signups
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height="100%">
        <MuiBarChart
          data={chartData}
          margin={{
            top: 20,
            right: isMobile ? 10 : 30,
            left: isMobile ? -10 : 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: isMobile ? 12 : 14 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: isMobile ? 12 : 14 }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value: number | string, name: string) => {
              if (name === "activeUsers") return [value, "Active Users"];
              if (name === "newSignups") return [value, "New Signups"];
              return [value, name];
            }}
          />
          <Legend />
          <Bar
            dataKey="activeUsers"
            name="Active Users"
            fill={theme.palette.primary.main}
            radius={[4, 4, 0, 0]}
            maxBarSize={isMobile ? 30 : 60}
          />
          <Bar
            dataKey="newSignups"
            name="New Signups"
            fill={theme.palette.success.main}
            radius={[4, 4, 0, 0]}
            maxBarSize={isMobile ? 30 : 60}
          />
        </MuiBarChart>
      </ResponsiveContainer>
    </Box>
  );
};
