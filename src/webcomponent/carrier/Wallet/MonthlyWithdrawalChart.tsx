"use client";

import React, { useEffect, useState } from "react";
import {
  getMonthlyWithdrawals,
  MonthlyWithdrawalData,
} from "@/api/wallets.api"; 

const ALL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function MonthlyWithdrawalChart() {
  const [chartData, setChartData] = useState<{ month: string; totalAmount: number; requests: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchWithdrawalChartData();
  }, []);

  const fetchWithdrawalChartData = async () => {
    try {
      setIsLoading(true);
      const res = await getMonthlyWithdrawals();
      
      let rawData: any[] = [];
      if (res?.success && Array.isArray(res.data)) {
        rawData = res.data;
      }

      // Map across all 12 months and accumulate total amounts for each month
      const completeData = ALL_MONTHS.map((monthName) => {
        const monthRecords = rawData.filter((item) => {
          if (!item.month && !item.date) return false;
          const itemMonth = item.month || new Date(item.date).toLocaleString('default', { month: 'long' });
          return itemMonth.toLowerCase().startsWith(monthName.substring(0, 3).toLowerCase());
        });

        const totalAmount = monthRecords.reduce((sum, record) => {
          const val = parseFloat(record.withdrawn || record.amount || "0");
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const requests = monthRecords.reduce((sum, record) => {
          return sum + (parseInt(record.withdrawals || record.requests || "0") || 1);
        }, 0);

        return {
          month: monthName,
          totalAmount,
          requests: totalAmount > 0 ? requests : 0,
        };
      });

      setChartData(completeData);
    } catch (err) {
      console.error("Failed to load monthly withdrawal chart data:", err);
      setChartData(ALL_MONTHS.map((m) => ({ month: m, totalAmount: 0, requests: 0 })));
    } finally {
      setIsLoading(false);
    }
  };

  // Find max value in data to establish scale ceiling (rounded up to nearest 100)
  const rawMax = Math.max(...chartData.map((d) => d.totalAmount), 0);
  const yAxisMax = Math.max(Math.ceil((rawMax || 300) / 100) * 100, 300);

  // Generate 4 Y-axis tick intervals (e.g., $300, $200, $100, $0)
  const step = yAxisMax / 3;
  const yAxisTicks = [yAxisMax, Math.round(step * 2), Math.round(step), 0];

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Monthly Withdrawals</h3>
            <p className="text-xs text-gray-400">
              Historical view of payout amounts across 12 months
            </p>
          </div>
          <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-semibold">
            Payout History
          </span>
        </div>

        {/* Main Chart Section with Left Y-Axis and Bottom X-Axis */}
        <div className="h-56 flex gap-3 pt-4">
          {/* Left Y-Axis Scale (100, 200, 300...) */}
          <div className="flex flex-col justify-between text-right text-[11px] font-medium text-gray-400 pb-7 select-none w-8 border-r border-gray-100 pr-2">
            {yAxisTicks.map((tick) => (
              <span key={tick}>${tick}</span>
            ))}
          </div>

          {/* Right Chart Area */}
          <div className="flex-1 flex flex-col justify-between relative">
            {/* Background Grid Lines matching Y-Axis Ticks */}
            <div className="absolute inset-0 pb-7 flex flex-col justify-between pointer-events-none">
              {yAxisTicks.map((tick) => (
                <div key={tick} className="border-b border-gray-100 w-full h-0" />
              ))}
            </div>

            {/* Bars and X-Axis Container */}
            <div className="h-full flex items-end gap-1 sm:gap-2 relative z-10">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  Loading chart data...
                </div>
              ) : (
                chartData.map((data, index) => {
                  const heightPercentage = Math.min((data.totalAmount / yAxisMax) * 100, 100);

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2 group cursor-pointer min-w-0 h-full justify-end"
                    >
                      {/* Bar Track */}
                      <div className="w-full relative rounded-t-md bg-transparent flex items-end h-full">
                        <div
                          style={{ height: `${heightPercentage}%` }}
                          className="w-full bg-purple-600 rounded-t-md transition-all duration-500 relative group-hover:bg-purple-700 min-h-[2px]"
                        >
                          {/* Hover Tooltip */}
                          <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-20">
                            <div>
                              {data.month}: ${data.totalAmount.toFixed(2)}
                            </div>
                            <div className="text-[9px] text-gray-300 font-normal">
                              {data.requests} {data.requests === 1 ? "transaction" : "transactions"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* X-Axis Month Label */}
                      <span className="text-[10px] sm:text-xs text-gray-400 font-medium truncate w-full text-center">
                        {data.month.substring(0, 3)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}