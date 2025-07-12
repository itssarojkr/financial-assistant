
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  HelpCircle,
  Star,
  CheckCircle,
  PlayCircle,
  BookOpen,
  Award,
  Lightbulb
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
      description: "Calculate taxes for 10+ countries with accurate local rates and regulations",
      badge: "Popular"
    },
    {
      icon: <Calculator className="w-8 h-8 text-green-600" />,
      title: "Smart Calculations",
      description: "Advanced algorithms that consider deductions, rebates, and local tax brackets",
      badge: "AI-Powered"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: "Savings Analysis",
      description: "Get insights into your take-home pay and potential savings opportunities",
      badge: "Insights"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Financial Dashboard",
      description: "Track expenses, manage budgets, and monitor your financial health",
      badge: "Pro"
    },
    {
      icon: <Target className="w-8 h-8 text-red-600" />,
      title: "Budget Planning",
      description: "Set spending limits and get alerts when you exceed your budget",
      badge: "Smart"
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      title: "Secure & Private",
      description: "Your financial data is encrypted and never shared with third parties",
      badge: "Secure"
    }
  ];

  const stats = [
    { number: "10+", label: "Countries Supported", icon: <Globe className="w-5 h-5" /> },
    { number: "99%", label: "Accuracy Rate", icon: <Target className="w-5 h-5" /> },
    { number: "24/7", label: "Available", icon: <Shield className="w-5 h-5" /> },
    { number: "Free", label: "Forever", icon: <Award className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      content: "The tax calculator saved me hours of research. Accurate and easy to use!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Financial Advisor",
      content: "I recommend this to all my clients. The multi-country support is fantastic.",
      rating: 5
    },
    {
      name: "Emma Wilson",
      role: "Freelancer",
      content: "Perfect for calculating taxes across different countries. Love the insights!",
      rating: 5
    }
  ];

  const quickActions = [
    {
      title: "Calculate Taxes",
      description: "Get instant tax calculations",
      icon: <Calculator className="w-6 h-6" />,
      action: handleGetStarted,
      primary: true
    },
    {
      title: "Watch Demo",
      description: "See how it works",
      icon: <PlayCircle className="w-6 h-6" />,
      action: () => navigate('/help'),
      primary: false
    },
    {
      title: "Learn More",
      description: "Explore features",
      icon: <BookOpen className="w-6 h-6" />,
      action: () => navigate('/help'),
      primary: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-6000"></div>
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
        <div className="absolute top-1/3 left-1/4 animate-float animation-delay-4000">
          <Lightbulb className="w-5 h-5 text-yellow-400 opacity-25" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Enhanced Header */}
        <header className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Calculator className="w-8 h-8 text-blue-600" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Financial Assistant
                </h1>
                <Badge variant="secondary" className="text-xs mt-1">Beta</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Button onClick={() => navigate('/dashboard')} variant="ghost">
                    Dashboard
                  </Button>
                  <Button onClick={() => navigate('/tax-calculator')} variant="outline">
                    Calculator
                  </Button>
                </div>
              ) : (
                <>
                  <Button onClick={() => navigate('/help')} variant="ghost">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help
                  </Button>
                  <Button onClick={handleSignIn} variant="ghost">
                    Sign In
                  </Button>
                  <Button onClick={handleSignUp} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Enhanced Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
                <Sparkles className="w-3 h-3 mr-1" />
                New: Multi-Country Tax Support
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Calculate Your
                <br />
                <span className="relative">
                  Take-Home Pay
                  <Zap className="w-8 h-8 text-yellow-500 absolute -top-2 -right-12 animate-bounce" />
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-4xl mx-auto">
                Get accurate salary estimates and financial insights for any country worldwide. 
                <br />
                <span className="font-semibold text-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Plan your future with confidence and make informed financial decisions.
                </span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    action.primary ? 'ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-purple-50' : ''
                  }`}
                  onClick={action.action}
                >
                  <CardContent className="p-4 text-center">
                    <div className="mb-2 flex justify-center">
                      <div className={`p-2 rounded-lg ${action.primary ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {action.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                onClick={handleGetStarted} 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Calculator className="mr-2 w-5 h-5" />
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
                  <Users className="mr-2 w-5 h-5" />
                  Sign Up Free
                </Button>
              )}
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Trusted by 10,000+ Users
            </Badge>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Everything You Need for Financial Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From tax calculations to financial planning, we've got you covered with powerful tools, 
              real-time insights, and expert-level accuracy you can trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden"
              >
                <CardContent className="p-8 text-center relative">
                  <Badge className="absolute top-4 right-4 text-xs" variant="secondary">
                    {feature.badge}
                  </Badge>
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    <div className="p-3 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-purple-50 transition-colors duration-300">
                      {feature.icon}
                    </div>
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

        {/* New Testimonials Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Loved by Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardContent className="p-12 text-center relative">
              <div className="mb-6">
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Limited Time Offer
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Take Control of Your Finances?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of users who trust us for accurate tax calculations and financial insights. 
                Start your journey to financial clarity today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleGetStarted} 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                >
                  <Calculator className="mr-2 w-5 h-5" />
                  Start Calculating
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                {!user && (
                  <Button 
                    onClick={handleSignUp} 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
                  >
                    <Users className="mr-2 w-5 h-5" />
                    Create Free Account
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Enhanced Footer */}
        <footer className="container mx-auto px-6 py-12 text-center text-gray-600 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">Financial Assistant</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Built for global professionals</span>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mb-4 text-sm">
            <button onClick={() => navigate('/help')} className="hover:text-blue-600 transition-colors">
              Help Center
            </button>
            <button onClick={() => navigate('/help')} className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => navigate('/help')} className="hover:text-blue-600 transition-colors">
              Terms of Service
            </button>
          </div>
          <p className="text-sm">&copy; 2024 Financial Assistant. All rights reserved.</p>
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
        
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
};

export default Landing;
