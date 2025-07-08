import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Globe, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Target,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Users,
  HelpCircle
} from 'lucide-react';

const Landing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/tax-calculator');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const features = [
    {
      icon: <Globe className="w-8 h-8 text-blue-600" />,
      title: "Global Coverage",
      description: "Calculate taxes for 10+ countries with accurate local rates and regulations"
    },
    {
      icon: <Calculator className="w-8 h-8 text-green-600" />,
      title: "Smart Calculations",
      description: "Advanced algorithms that consider deductions, rebates, and local tax brackets"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: "Savings Analysis",
      description: "Get insights into your take-home pay and potential savings opportunities"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Financial Dashboard",
      description: "Track expenses, manage budgets, and monitor your financial health"
    },
    {
      icon: <Target className="w-8 h-8 text-red-600" />,
      title: "Budget Planning",
      description: "Set spending limits and get alerts when you exceed your budget"
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      title: "Secure & Private",
      description: "Your financial data is encrypted and never shared with third parties"
    }
  ];

  const stats = [
    { number: "10+", label: "Countries Supported" },
    { number: "99%", label: "Accuracy Rate" },
    { number: "24/7", label: "Available" },
    { number: "Free", label: "Forever" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 animate-float">
          <DollarSign className="w-6 h-6 text-blue-400 opacity-30" />
        </div>
        <div className="absolute top-40 right-32 animate-float animation-delay-1000">
          <Calculator className="w-6 h-6 text-green-400 opacity-30" />
        </div>
        <div className="absolute bottom-32 left-32 animate-float animation-delay-2000">
          <TrendingUp className="w-6 h-6 text-purple-400 opacity-30" />
        </div>
        <div className="absolute bottom-20 right-20 animate-float animation-delay-3000">
          <BarChart3 className="w-6 h-6 text-orange-400 opacity-30" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Calculator className="w-8 h-8 text-blue-600" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Financial Assistant
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button onClick={() => navigate('/tax-calculator')} variant="outline">
                  Calculator
                </Button>
              ) : (
                <>
                  <Button onClick={() => navigate('/help')} variant="ghost">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help
                  </Button>
                  <Button onClick={handleSignIn} variant="ghost">
                    Sign In
                  </Button>
                  <Button onClick={handleSignUp}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Calculate Your
                <br />
                <span className="relative">
                  Take-Home Pay
                  <Zap className="w-8 h-8 text-yellow-500 absolute -top-2 -right-12 animate-bounce" />
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Get accurate salary estimates and financial insights for any country worldwide. 
                <br />
                <span className="font-semibold text-gray-700">
                  Plan your future with confidence.
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                onClick={handleGetStarted} 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Try Calculator Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              {!user && (
                <Button 
                  onClick={handleSignUp} 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 border-2 hover:bg-gray-50 transition-all duration-300"
                >
                  Sign Up Free
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From tax calculations to financial planning, we've got you covered with powerful tools and insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of users who trust us for their financial calculations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleGetStarted} 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
                >
                  Start Calculating
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                {!user && (
                  <Button 
                    onClick={handleSignUp} 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Create Account
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 text-center text-gray-600">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Users className="w-5 h-5" />
            <span>Built for global professionals</span>
          </div>
          <p>&copy; 2024 Financial Assistant. All rights reserved.</p>
        </footer>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Landing; 