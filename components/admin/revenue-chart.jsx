"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/lib/format";

export default function RevenueChart({ data }) {
  return (
    <div className="revenue-chart" role="img" aria-label="গত ছয় মাসের মাসভিত্তিক বিক্রির চার্ট">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(value) => new Intl.NumberFormat("bn-BD", { notation: "compact", maximumFractionDigits: 0 }).format(value)} width={42} />
          <Tooltip formatter={(value) => formatPrice(Number(value || 0))} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--ink)" }} labelStyle={{ color: "var(--muted)" }} />
          <Area type="monotone" dataKey="revenue" name="বিক্রি" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#revenueFill)" activeDot={{ r: 4, fill: "var(--chart-1)", stroke: "var(--surface)", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
