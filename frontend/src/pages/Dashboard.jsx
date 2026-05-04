import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useOrganization } from '@clerk/clerk-react';

const PROGRESS_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#64748b'];

const Dashboard = () => {
  const { organization } = useOrganization();
  const [summary, setSummary] = useState({ bankBalance: 0, totalCredit: 0, totalDebit: 0, totalInvested: 0 });
  const [dailyData, setDailyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { isDark } = useTheme();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, dailyRes, categoryRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/daily?days=30'),
        api.get(`/analytics/monthly-category?month=${selectedMonth}&year=${selectedYear}`)
      ]);
      setSummary(summaryRes.data);
      setDailyData(dailyRes.data);
      setCategoryData(categoryRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear, organization?.id]);

  if (loading && summary.bankBalance === 0) {
    return <div className="py-10 text-center text-slate-500 dark:text-slate-400">Loading dashboard...</div>;
  }

  const totalCategoryExpense = categoryData.reduce((acc, curr) => acc + curr.value, 0);
  const recentDaysData = dailyData.slice(-7);
  const maxRecentExpense = Math.max(...recentDaysData.map(d => d.amount), 0);

  // We will pass isDark to the Recharts Tooltip to change its background styling
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    borderRadius: '12px',
    border: isDark ? '1px solid #334155' : 'none',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  };

  return (
    <div className="py-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Stats Row */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-8 md:gap-0 justify-between items-start md:items-center transition-colors">
        <div className="flex-1 w-full md:border-r border-slate-200 dark:border-slate-800 px-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Bank Balance</p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{summary.bankBalance.toLocaleString('en-IN')}
          </h2>
        </div>
        <div className="flex-1 w-full md:border-r border-slate-200 dark:border-slate-800 px-4 md:px-8">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Income</p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{summary.totalCredit.toLocaleString('en-IN')}
          </h2>
        </div>
        <div className="flex-1 w-full md:border-r border-slate-200 dark:border-slate-800 px-4 md:px-8">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Expense</p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{summary.totalDebit.toLocaleString('en-IN')}
          </h2>
        </div>
        <div className="flex-1 w-full px-4 md:px-8">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Invested</p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{summary.totalInvested.toLocaleString('en-IN')}
          </h2>
        </div>
      </div>

      {/* Main Area Chart */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Expense Tracker</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{summary.totalDebit.toLocaleString('en-IN')}
              </span>
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold px-2 py-1 rounded-full transition-colors">
                Last 30 Days
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-500 dark:text-slate-400">Daily Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-slate-500 dark:text-slate-400">Daily Expense</span>
            </div>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={isDark ? 0.6 : 0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={isDark ? 0.6 : 0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12 }} 
                dy={10}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12 }} 
                tickFormatter={(value) => value > 0 ? `${value / 1000}k` : 0}
              />
              <RechartsTooltip 
                contentStyle={tooltipStyle}
                itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                formatter={(value, name) => [`₹${value}`, name === 'amount' ? 'Expense' : 'Income']}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                activeDot={{ r: 6, fill: '#10b981', stroke: isDark ? '#0f172a' : '#fff', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                activeDot={{ r: 6, fill: '#8b5cf6', stroke: isDark ? '#0f172a' : '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown (Progress Bars) */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Expenses by Category</h3>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-6">
            {categoryData.length > 0 ? categoryData.map((cat, index) => {
              const percentage = totalCategoryExpense > 0 ? Math.round((cat.value / totalCategoryExpense) * 100) : 0;
              const color = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
              return (
                <div key={cat.name}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 transition-colors">
                    <div 
                      className="h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${percentage}%`, backgroundColor: color }}
                    ></div>
                  </div>
                </div>
              )
            }) : (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                No expenses recorded for this month.
              </div>
            )}
          </div>
        </div>

        {/* Daily Costing Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Daily Costing</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your expenses over the last 7 days</p>
          </div>
          
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentDaysData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12 }} 
                  dy={10}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return d.toLocaleDateString('default', { weekday: 'short' });
                  }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12 }} 
                  tickFormatter={(value) => value > 0 ? `${value / 1000}k` : 0}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                  formatter={(value) => [`₹${value}`, 'Expense']}
                />
                <Bar dataKey="amount" radius={[6, 6, 6, 6]} barSize={24}>
                  {recentDaysData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.amount === maxRecentExpense && entry.amount > 0 ? '#8b5cf6' : (isDark ? '#334155' : '#e2e8f0')} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
