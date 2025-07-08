import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  PieChart,
  BarChart3,
  Target,
  Bell
} from 'lucide-react';
import { AnalyticsService } from '@/application/services/AnalyticsService';
import type { SpendingInsights } from '@/application/services/AnalyticsService';

interface ExpenseAnalyticsProps {
  analytics: SpendingInsights;
  period: string;
}

export const ExpenseAnalytics: React.FC<ExpenseAnalyticsProps> = ({
  analytics,
  period,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      daily: 'Today',
      weekly: 'This Week',
      monthly: 'This Month',
      quarterly: 'This Quarter',
      yearly: 'This Year',
    };
    return labels[period] || period;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <TrendingUp className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.total_spent)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="text-gray-600">
                Average daily: {formatCurrency(analytics.average_daily_spending)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.top_categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Categories tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Performance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.budget_performance.length}</div>
            <p className="text-xs text-muted-foreground">
              Budgets tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.alerts_summary.active_alerts}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.alerts_summary.triggered_alerts} triggered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Top Spending Categories
          </CardTitle>
          <CardDescription>
            {getPeriodLabel(period)} spending breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.top_categories.map((category) => (
              <div key={category.category_id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <div>
                    <p className="font-medium">{category.category_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.percentage.toFixed(1)}% of total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(category.amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {category.count} transactions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Budget Performance
          </CardTitle>
          <CardDescription>
            How you're doing against your budgets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.budget_performance.map((budget) => (
              <div key={budget.category_id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    budget.status === 'over' ? 'bg-red-500' : 
                    budget.status === 'on_track' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium">{budget.category_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {budget.percentage_used.toFixed(1)}% used
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(budget.spent_amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    / {formatCurrency(budget.budget_amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spending Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Spending Trends
          </CardTitle>
          <CardDescription>
            Daily spending over the period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1">
            {analytics.spending_trend.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div 
                  className="w-8 bg-blue-500 rounded-t"
                  style={{ 
                    height: `${Math.max((day.amount / Math.max(...analytics.spending_trend.map(d => d.amount))) * 200, 4)}px` 
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}; 