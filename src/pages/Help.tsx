import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/Header';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Globe, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Target,
  Bell,
  Save,
  FolderOpen,
  Users,
  Shield,
  Zap,
  BookOpen,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  Info,
  AlertTriangle,
  Star,
  PieChart,
  Calendar,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Minus
} from 'lucide-react';

const Help: React.FC = () => {
  const navigate = useNavigate();

  const supportedCountries = [
    { name: 'India', currency: '₹', features: ['New & Old Tax Regimes', 'Section 80C Deductions', 'Health & Education Cess'] },
    { name: 'United States', currency: '$', features: ['Federal & State Taxes', 'Social Security', 'Medicare', '401(k) Deductions'] },
    { name: 'Canada', currency: 'C$', features: ['Federal & Provincial Taxes', 'CPP Contributions', 'EI Premiums'] },
    { name: 'United Kingdom', currency: '£', features: ['Income Tax', 'National Insurance', 'Student Loan Repayments'] },
    { name: 'Australia', currency: 'A$', features: ['Income Tax', 'Medicare Levy', 'Superannuation'] },
    { name: 'Germany', currency: '€', features: ['Income Tax', 'Solidarity Surcharge', 'Church Tax'] },
    { name: 'France', currency: '€', features: ['Income Tax', 'CSG/CRDS', 'Social Security'] },
    { name: 'Brazil', currency: 'R$', features: ['INSS Contributions', 'IRPF', 'Social Security'] },
    { name: 'South Africa', currency: 'R', features: ['Income Tax', 'UIF Contributions', 'Tax Rebates'] }
  ];

  const features = [
    {
      icon: <Calculator className="w-8 h-8 text-blue-600" />,
      title: "Global Tax Calculator",
      description: "Calculate take-home pay for 10+ countries with accurate local tax rates and regulations",
      details: [
        "Real-time tax calculations based on current rates",
        "Support for multiple tax regimes (e.g., India's New vs Old regime)",
        "Automatic deduction calculations",
        "Detailed tax bracket breakdowns",
        "What-if scenario analysis"
      ]
    },
    {
      icon: <Globe className="w-8 h-8 text-green-600" />,
      title: "Multi-Country Support",
      description: "Work with tax systems from major economies worldwide",
      details: [
        "10+ countries supported with more coming",
        "Local currency support",
        "Country-specific deductions and credits",
        "Regional tax variations (states, provinces)",
        "Automatic currency conversion"
      ]
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: "Savings Analysis",
      description: "Get insights into your take-home pay and potential savings opportunities",
      details: [
        "Net salary calculations",
        "Effective tax rate analysis",
        "Marginal tax rate information",
        "Savings potential recommendations",
        "Living expenses integration"
      ]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Financial Dashboard",
      description: "Track expenses, manage budgets, and monitor your financial health",
      details: [
        "Expense tracking with categories",
        "Budget management and alerts",
        "Spending analytics and insights",
        "Visual charts and reports",
        "Monthly and yearly summaries"
      ]
    },
    {
      icon: <Target className="w-8 h-8 text-red-600" />,
      title: "Budget Planning",
      description: "Set spending limits and get alerts when you exceed your budget",
      details: [
        "Category-based budget setting",
        "Real-time budget tracking",
        "Over-budget alerts",
        "Budget performance analytics",
        "Flexible budget periods"
      ]
    },
    {
      icon: <Bell className="w-8 h-8 text-indigo-600" />,
      title: "Smart Alerts",
      description: "Stay informed about your spending patterns and budget status",
      details: [
        "Spending threshold alerts",
        "Budget limit notifications",
        "Unusual spending detection",
        "Customizable alert preferences",
        "Email and in-app notifications"
      ]
    },
    {
      icon: <Save className="w-8 h-8 text-teal-600" />,
      title: "Calculation Storage",
      description: "Save and manage your tax calculations for future reference",
      details: [
        "Save multiple calculations",
        "Favorite important calculations",
        "Load previous calculations",
        "Calculation history",
        "Export calculation data"
      ]
    },
    {
      icon: <Shield className="w-8 h-8 text-gray-600" />,
      title: "Secure & Private",
      description: "Your financial data is encrypted and never shared with third parties",
      details: [
        "End-to-end encryption",
        "Secure authentication",
        "Data privacy compliance",
        "No third-party data sharing",
        "Regular security audits"
      ]
    }
  ];

  const quickStartSteps = [
    {
      step: 1,
      title: "Choose Your Country",
      description: "Select your country from the dropdown menu to access the appropriate tax calculator.",
      icon: <Globe className="w-6 h-6" />
    },
    {
      step: 2,
      title: "Enter Your Salary",
      description: "Input your gross annual salary in the local currency. The calculator will automatically convert if needed.",
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      step: 3,
      title: "Configure Tax Options",
      description: "Set country-specific options like tax regime (India), filing status (US), or province (Canada).",
      icon: <Settings className="w-6 h-6" />
    },
    {
      step: 4,
      title: "Add Deductions",
      description: "Include any applicable deductions like retirement contributions, health insurance, or other tax benefits.",
      icon: <Minus className="w-6 h-6" />
    },
    {
      step: 5,
      title: "Review Results",
      description: "View your detailed tax breakdown, take-home pay, and effective tax rate.",
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      step: 6,
      title: "Save & Analyze",
      description: "Save your calculation, add living expenses, and explore savings analysis.",
      icon: <Save className="w-6 h-6" />
    }
  ];

  const dashboardFeatures = [
    {
      title: "Expense Tracking",
      description: "Record and categorize your daily expenses",
      features: [
        "Add expenses with descriptions and categories",
        "Set custom expense categories",
        "Track spending by date and location",
        "Bulk expense import/export",
        "Receipt photo upload (coming soon)"
      ]
    },
    {
      title: "Budget Management",
      description: "Create and monitor spending budgets",
      features: [
        "Set monthly/yearly budgets by category",
        "Real-time budget progress tracking",
        "Over-budget warnings and alerts",
        "Budget performance analytics",
        "Flexible budget periods"
      ]
    },
    {
      title: "Analytics & Insights",
      description: "Get detailed insights into your spending patterns",
      features: [
        "Spending trend analysis",
        "Category-wise breakdown",
        "Monthly/yearly comparisons",
        "Savings rate calculation",
        "Financial health score"
      ]
    },
    {
      title: "Smart Alerts",
      description: "Stay informed about your financial status",
      features: [
        "Spending threshold alerts",
        "Budget limit notifications",
        "Unusual spending detection",
        "Bill payment reminders",
        "Savings goal tracking"
      ]
    }
  ];

  const tips = [
    {
      category: "Tax Optimization",
      tips: [
        "Use the What-If calculator to compare different scenarios",
        "Explore all available deductions for your country",
        "Consider tax regime changes (e.g., India's New vs Old regime)",
        "Plan your salary structure to minimize tax liability",
        "Keep track of tax-saving investments and expenses"
      ]
    },
    {
      category: "Budget Management",
      tips: [
        "Start with realistic budget targets",
        "Review and adjust budgets monthly",
        "Use the 50/30/20 rule as a starting point",
        "Set up alerts for important thresholds",
        "Track irregular expenses separately"
      ]
    },
    {
      category: "Expense Tracking",
      tips: [
        "Record expenses immediately for accuracy",
        "Use consistent categories for better analysis",
        "Review spending patterns weekly",
        "Set up recurring expense reminders",
        "Keep receipts for tax purposes"
      ]
    },
    {
      category: "Savings Strategy",
      tips: [
        "Aim to save at least 20% of your take-home pay",
        "Automate savings transfers",
        "Build an emergency fund first",
        "Diversify your savings goals",
        "Review and adjust savings targets regularly"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Help & Guide</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about using the Financial Assistant to calculate taxes, 
            track expenses, and manage your finances effectively.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  What is Financial Assistant?
                </CardTitle>
                <CardDescription>
                  A comprehensive financial tool that helps you calculate taxes, track expenses, and plan your budget.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {features.map((feature, index) => (
                    <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {feature.icon}
                          <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                        <ul className="space-y-1">
                          {feature.details.map((detail, idx) => (
                            <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Get started with the Financial Assistant in 6 simple steps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickStartSteps.map((step, index) => (
                    <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                            {step.step}
                          </Badge>
                          {step.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button onClick={() => navigate('/calculator')} size="lg">
                    Start Calculating Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Tax Calculator Features
                </CardTitle>
                <CardDescription>
                  Learn how to use the advanced tax calculation features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Basic Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Real-time tax calculations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Multiple country support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Automatic currency conversion
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Detailed tax breakdowns
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Advanced Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        What-if scenario analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Deduction optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Tax regime comparison
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Savings analysis
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-3">How to Use the Calculator</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">1</Badge>
                      <div>
                        <h4 className="font-medium">Select Your Country</h4>
                        <p className="text-sm text-gray-600">
                          Choose your country from the dropdown. This will load the appropriate tax calculator with local rates and regulations.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">2</Badge>
                      <div>
                        <h4 className="font-medium">Enter Your Salary</h4>
                        <p className="text-sm text-gray-600">
                          Input your gross annual salary. The calculator will automatically handle currency conversion if needed.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">3</Badge>
                      <div>
                        <h4 className="font-medium">Configure Options</h4>
                        <p className="text-sm text-gray-600">
                          Set country-specific options like tax regime, filing status, province, or other relevant parameters.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">4</Badge>
                      <div>
                        <h4 className="font-medium">Add Deductions</h4>
                        <p className="text-sm text-gray-600">
                          Include any applicable deductions like retirement contributions, health insurance, or other tax benefits.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">5</Badge>
                      <div>
                        <h4 className="font-medium">Review Results</h4>
                        <p className="text-sm text-gray-600">
                          View your detailed tax breakdown, including federal tax, state/provincial tax, social security, and take-home pay.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Financial Dashboard Guide
                </CardTitle>
                <CardDescription>
                  Learn how to use the dashboard to track expenses, manage budgets, and analyze your spending.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dashboardFeatures.map((feature, index) => (
                    <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {feature.features.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-3">Dashboard Tabs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Overview</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        View spending analytics, budget performance, and financial insights at a glance.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-medium">Expenses</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        Add, edit, and categorize your expenses with detailed tracking.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">Budgets</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        Set and monitor spending budgets by category with progress tracking.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-red-500" />
                        <span className="font-medium">Alerts</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        Manage spending alerts and notifications for budget limits.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Countries Tab */}
          <TabsContent value="countries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Supported Countries
                </CardTitle>
                <CardDescription>
                  Tax calculation support for major economies worldwide.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supportedCountries.map((country, index) => (
                    <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-lg">{country.currency}</span>
                          {country.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {country.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips & Tricks Tab */}
          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Tips & Best Practices
                </CardTitle>
                <CardDescription>
                  Expert tips to help you make the most of the Financial Assistant.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {tips.map((category, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-lg mb-3">{category.category}</h3>
                    <ul className="space-y-2">
                      {category.tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                    {index < tips.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Common questions and answers about using the Financial Assistant.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Tax Calculator</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">How accurate are the tax calculations?</h4>
                        <p className="text-sm text-gray-600">
                          Our calculations are based on current tax rates and regulations. However, tax laws change frequently, 
                          so we recommend consulting with a tax professional for final decisions.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Can I save my calculations?</h4>
                        <p className="text-sm text-gray-600">
                          Yes! Sign in to save your calculations and access them later. You can also favorite important calculations for quick access.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">What if my country isn't supported?</h4>
                        <p className="text-sm text-gray-600">
                          We're constantly adding new countries. If your country isn't supported yet, you can still use the basic calculator 
                          and we'll notify you when support is added.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Dashboard & Expenses</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">How do I add expenses?</h4>
                        <p className="text-sm text-gray-600">
                          Go to the Dashboard → Expenses tab and click the "Add Expense" button. Fill in the amount, category, 
                          date, and description.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Can I import expenses from other apps?</h4>
                        <p className="text-sm text-gray-600">
                          Currently, you can manually add expenses. CSV import functionality is coming soon.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">How do budgets work?</h4>
                        <p className="text-sm text-gray-600">
                          Set monthly or yearly budgets by category. The system tracks your spending and alerts you when you're 
                          approaching or exceeding limits.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Account & Security</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">Is my financial data secure?</h4>
                        <p className="text-sm text-gray-600">
                          Yes, we use end-to-end encryption and follow strict security protocols. Your data is never shared with third parties.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Can I export my data?</h4>
                        <p className="text-sm text-gray-600">
                          Yes, you can export your expenses, budgets, and calculations in various formats for backup or analysis.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">What if I forget my password?</h4>
                        <p className="text-sm text-gray-600">
                          Use the "Forgot Password" link on the sign-in page to reset your password via email.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-8 border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6">
              Start calculating your taxes and managing your finances today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/calculator')} 
                variant="secondary" 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Try Tax Calculator
                <Calculator className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Go to Dashboard
                <BarChart3 className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help; 