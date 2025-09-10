import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/Components/ui/chart";
import Authenticated from "@/Layout/AuthenticatedLayout";
import type { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { CartesianGrid, XAxis, Bar, BarChart } from "recharts";


interface SuperAdminDashboardProps {
  user: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };

  auth: {
    user: User;
    roles: string;
  };
  [key: string]: any;
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const user = {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    next_page_url: null,
    prev_page_url: null,
  };

  const chartData = [
    { month: "January", Jawa: 186, China: 80 },
    { month: "February", Jawa: 305, China: 200 },
    { month: "March", Jawa: 237, China: 120 },
    { month: "April", Jawa: 73, China: 190 },
    { month: "May", Jawa: 209, China: 130 },
    { month: "June", Jawa: 214, China: 140 },
  ];

  const chartConfig = {
    Jawa: {
      label: "Jawa",
      color: "#2563eb",
    },
    China: {
      label: "China",
      color: "#60a5fa",
    },
  } satisfies ChartConfig;

  return (
    <Authenticated>
      <div className="flex w-full flex-col max-h-screen items-start justify-start px-8 py-4 bg-primary-bg gap-4">
        <h1 className="text-2xl font-bold">Data Statistic</h1>
        <div className="flex w-full justify-center items-center gap-4 ">
          <div className="bg-primary-fg w-full text-primary-bg p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Total Users</h2>
            <p className="text-xl">{user.total}</p>
          </div>

          <div className="bg-primary-fg w-full text-primary-bg p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Active Fundraiser</h2>
            <p className="text-xl">5</p>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[380px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="Jawa" fill="var(--color-Jawa)" radius={4} />
            <Bar dataKey="China" fill="var(--color-China)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </Authenticated>
  );
}
