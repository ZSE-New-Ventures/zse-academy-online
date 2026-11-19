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
    <Box sx={{ width: "100%" }}>
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
      <Box sx={{ height: height, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <MuiBarChart
            data={chartData}
            margin={{
              top: 15,
              right: isMobile ? 10 : 25,
              left: isMobile ? -15 : -10,
              bottom: 15,
            }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            )}
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: isMobile ? 11 : 13 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{ fill: "#6b7280", fontSize: isMobile ? 11 : 13 }}
              tickFormatter={(value) => Math.round(Number(value)).toString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name="Active Users"
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 30 : 54}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.growth && entry.growth > 0 ? theme.palette.success.main : color}
                  opacity={entry.growth && entry.growth > 0 ? 0.9 : 0.75}
                />
              ))}
            </Bar>
          </MuiBarChart>
        </ResponsiveContainer>
      </Box>
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
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="600" color="text.primary">
          Weekly User Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Daily active users and new signups
        </Typography>
      </Box>
      <Box sx={{ height: 260, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <MuiBarChart
            data={chartData}
            margin={{
              top: 15,
              right: isMobile ? 10 : 25,
              left: isMobile ? -15 : -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: isMobile ? 11 : 13 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{ fill: "#6b7280", fontSize: isMobile ? 11 : 13 }}
              tickFormatter={(value) => Math.round(Number(value)).toString()}
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
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ paddingTop: 8 }}
            />
            <Bar
              dataKey="activeUsers"
              name="Active Users"
              fill={theme.palette.primary.main}
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 24 : 44}
            />
            <Bar
              dataKey="newSignups"
              name="New Signups"
              fill={theme.palette.success.main}
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 24 : 44}
            />
          </MuiBarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};
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
