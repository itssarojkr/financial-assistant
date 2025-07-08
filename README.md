# Financial Assistant

A comprehensive cross-platform financial management application with advanced tax calculations, expense tracking, and budget management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for backend)
- Android Studio (for mobile development)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd financial-assistant

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Mobile Development
```bash
# Build for mobile
npm run build

# Add Android platform
npm run cap:add:android

# Open in Android Studio
npm run cap:open:android
```

## 🌟 Features

### 💰 Multi-Country Tax Calculator
- **9 Supported Countries**: US, India, Canada, UK, Australia, Germany, France, Brazil, South Africa
- **Real-time Calculations**: Instant tax estimates with deductions
- **What-if Scenarios**: Compare different salary and deduction options
- **Export & Save**: Save calculations for future reference

### 📊 Expense Tracking
- **Categorized Expenses**: Pre-defined categories with custom options
- **Budget Management**: Set and track spending limits
- **Analytics Dashboard**: Visual insights into spending patterns
- **Smart Alerts**: Notifications when approaching budget limits

### 📱 Cross-Platform Support
- **Web Application**: Responsive design for all devices
- **Mobile Apps**: Native Android and iOS applications
- **Progressive Web App**: Offline functionality and app-like experience

### 🔒 Security & Privacy
- **User Authentication**: Secure login with Supabase Auth
- **Data Encryption**: All data encrypted in transit and at rest
- **Row Level Security**: Database-level access control
- **Privacy First**: User data never shared with third parties

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality components

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Robust database
- **Row Level Security (RLS)** - Data security

### Mobile
- **Capacitor** - Cross-platform mobile framework
- **Android Studio** - Android development
- **Xcode** - iOS development (macOS)

### Testing
- **Vitest** - Fast unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

### Getting Started
- **[Project Overview](./docs/overview.md)** - Introduction and features
- **[Quick Start Guide](./docs/quick-start.md)** - Get up and running quickly
- **[Installation Guide](./docs/installation.md)** - Detailed setup instructions

### Development
- **[Development Guide](./docs/development.md)** - Development workflow
- **[Architecture Overview](./docs/architecture.md)** - System design
- **[API Documentation](./docs/api.md)** - Backend API reference

### Database
- **[Database Schema](./docs/database/schema.md)** - Complete database structure
- **[SQL Migration Guide](./docs/database/migrations.md)** - Database migrations
- **[Performance Optimization](./docs/database/performance.md)** - Database performance

### Security
- **[Security Guide](./docs/security/overview.md)** - Security best practices
- **[Supabase Security](./docs/security/supabase.md)** - Supabase security configuration

### Mobile Development
- **[Mobile Setup](./docs/mobile/setup.md)** - Cross-platform mobile setup
- **[Android Development](./docs/mobile/android.md)** - Android-specific guide
- **[Mobile Testing](./docs/mobile/testing.md)** - Mobile testing and debugging

### Testing
- **[Testing Guide](./docs/testing/overview.md)** - Testing strategy
- **[Test Cases](./docs/testing/cases.md)** - Automated test suite
- **[Performance Testing](./docs/testing/performance.md)** - Performance testing

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 📱 Mobile Development

### Android
```bash
# Build and sync to Android
npm run cap:build

# Open in Android Studio
npm run cap:open:android

# Run on device/emulator
npm run cap:run:android
```

### iOS (macOS only)
```bash
# Add iOS platform
npm run cap:add:ios

# Open in Xcode
npm run cap:open:ios

# Run on device/simulator
npm run cap:run:ios
```

## 🚀 Deployment

### Web Deployment
```bash
# Build for production
npm run build

# Deploy to your preferred platform
# (Vercel, Netlify, etc.)
```

### Mobile Deployment
```bash
# Build for production
npm run build

# Sync to mobile platforms
npm run cap:build

# Open in respective IDEs for final builds
npm run cap:open:android  # For Android APK
npm run cap:open:ios      # For iOS App Store
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run cap:build` | Build and sync to mobile |
| `npm run cap:open:android` | Open in Android Studio |
| `npm run cap:open:ios` | Open in Xcode |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details.

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow our code style guide

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 📞 Support

- **Documentation**: Check the [docs/](./docs/) directory
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join our community discussions
- **Email**: Contact us for critical issues

## 🎯 Project Status

### ✅ Completed Features
- Multi-country tax calculator
- User authentication and profiles
- Expense tracking system
- Budget management
- Mobile-responsive design
- Cross-platform mobile support
- Comprehensive testing suite
- Performance optimizations
- Security implementations

### 🚧 In Progress
- SMS transaction scanning (Android)
- Advanced analytics dashboard
- Export functionality
- Offline support

### 📅 Planned Features
- Real-time notifications
- Multi-currency support
- Advanced reporting
- API integrations
- **Home screen widgets (planned, not yet implemented)**
- **Wear OS integration (planned, not yet implemented)**

*These features are prioritized for future releases. Community contributions are welcome!*

---

**Ready to get started?** Check out our [Quick Start Guide](./docs/quick-start.md) to begin using Financial Assistant today!
