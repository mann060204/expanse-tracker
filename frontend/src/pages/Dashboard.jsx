import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useOrganization } from '@clerk/clerk-react';
import { Landmark } from 'lucide-react';

const PROGRESS_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#64748b'];

const Dashboard = () => {
  const { organization } = useOrganization();
  const [summary, setSummary] = useState({ bankBalance: 0, totalCredit: 0, totalDebit: 0, totalInvested: 0, totalIciciStipend: 0 });
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

      {/* Isolated ICICI Stipend Fund Card */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 shadow-md text-white flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
          <Landmark className="w-48 h-48" />
        </div>
        <div className="relative z-10 mb-4 md:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">ICICI Stipend Fund</h3>
          </div>
          <p className="text-orange-100 text-sm font-medium">Direct College Stipend Investment (Isolated from Main Bank Balance)</p>
        </div>
        <div className="relative z-10 text-left md:text-right">
          <p className="text-orange-100 text-sm font-medium mb-1">Total Accumulated</p>
          <h2 className="text-4xl font-bold tracking-tight">
            ₹{summary.totalIciciStipend.toLocaleString('en-IN')}
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

        {/* Cash Flow Overview Donut Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cash Flow Overview</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Income vs Expenses vs Investments</p>
          </div>
          
          <div className="flex-1 w-full min-h-[250px] relative flex flex-col justify-center mt-4">
            {summary.totalCredit > 0 || summary.totalDebit > 0 || summary.totalInvested > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Income', value: summary.totalCredit, color: '#10b981' },
                        { name: 'Expense', value: summary.totalDebit, color: '#ef4444' },
                        { name: 'Invested', value: summary.totalInvested, color: '#8b5cf6' }
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {[
                        { name: 'Income', value: summary.totalCredit, color: '#10b981' },
                        { name: 'Expense', value: summary.totalDebit, color: '#ef4444' },
                        { name: 'Invested', value: summary.totalInvested, color: '#8b5cf6' }
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-6 flex-wrap">
                  {[
                    { name: 'Income', color: '#10b981' },
                    { name: 'Expense', color: '#ef4444' },
                    { name: 'Invested', color: '#8b5cf6' }
                  ].map(entry => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                No cash flow data available.
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
