# TicketKatum - Frontend

A production-ready React-based booking system for buses, planes, and cinema tickets with integrated payment gateways (eSewa, Khalti, IME Pay).

## 🚀 Features

- **Multi-Service Booking**: Bus, Plane, and QFX Cinema ticket booking
- **User Authentication**: Separate user and admin authentication flows
- **Payment Integration**: eSewa, Khalti, and IME Pay payment gateways
- **Admin Panel**: Comprehensive dashboard for managing bookings, buses, routes
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark Mode**: Full dark mode support across the application
- **Role-Based Access**: USER, ADMIN, and SUPER_ADMIN roles with protected routes
- **Production Ready**: Optimized builds, code splitting, error handling

## 📋 Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Backend API**: Running instance of the TicketKatum Backend

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BusTicketFrontEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   For development, copy `.env.development`:
   ```bash
   cp .env.development .env
   ```

   Update the following variables:
   ```env
   REACT_APP_API_URL=http://localhost:8080
   REACT_APP_FRONTEND_URL=http://localhost:3000
   REACT_APP_KHALTI_PUBLIC_KEY=your_khalti_test_key
   REACT_APP_ESEWA_MERCHANT_ID=your_esewa_merchant_id
   ```

4. **Start development server**
   ```bash
   npm start
   ```

   The application will open at http://localhost:3000

## 🏗️ Build for Production

1. **Configure production environment**

   Copy and update `.env.production`:
   ```bash
   cp .env.production .env.production.local
   ```

   Update with your production values:
   ```env
   REACT_APP_API_URL=https://your-api.com
   REACT_APP_FRONTEND_URL=https://your-domain.com
   REACT_APP_KHALTI_PUBLIC_KEY=your_production_khalti_key
   REACT_APP_ESEWA_MERCHANT_ID=your_production_esewa_merchant_id
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Test production build locally**
   ```bash
   npm install -g serve
   serve -s build
   ```

## 🐳 Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t ticket-katum-frontend .
   ```

2. **Run container**
   ```bash
   docker run -p 80:80 ticket-katum-frontend
   ```

3. **Using Docker Compose** (recommended)
   ```yaml
   version: '3.8'
   services:
     frontend:
       build: .
       ports:
         - "80:80"
       environment:
         - NODE_ENV=production
   ```

## 📁 Project Structure

```
src/
├── components/        # Reusable React components
│   ├── admin/        # Admin panel components
│   ├── ui/           # UI components (dialogs, loaders)
│   └── ...
├── pages/            # Page components (routes)
├── services/         # API and authentication services
├── utils/            # Utility functions (validators, security, logger)
├── context/          # React context providers
├── config/           # Configuration files
└── assets/           # Static assets

```

## 🔒 Security Features

- **Input Validation**: Client-side validation with XSS protection
- **Secure Storage**: Encrypted local storage wrapper
- **Token Management**: JWT token expiration checking
- **CSRF Protection**: Request validation
- **Content Security Policy**: Via Nginx configuration
- **Environment Variables**: Sensitive data in env files

## 🧪 Testing

```bash
# Run linter
npm run lint

# Fix lint errors
npm run lint:fix

# Analyze bundle size
npm run build:analyze
```

## 📊 Performance Optimization

- **Code Splitting**: Lazy loading for all routes
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: Lazy loading and compression
- **Caching**: Service worker and browser caching (production)
- **Gzip Compression**: Nginx-level compression

## 🌐 Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Traditional Server Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Copy the `build` folder to your server

3. Configure Nginx (see `nginx.conf`)

4. Start Nginx:
   ```bash
   sudo systemctl start nginx
   ```

## 🔧 Configuration

### Payment Gateway Setup

#### eSewa
1. Get merchant credentials from eSewa
2. Update `REACT_APP_ESEWA_MERCHANT_ID` in env file

#### Khalti
1. Register at khalti.com
2. Get public key
3. Update `REACT_APP_KHALTI_PUBLIC_KEY` in env file

#### IME Pay
1. Contact IME Pay for merchant integration
2. Configure backend with IME Pay credentials

### API Integration

The application communicates with a backend API. Update `REACT_APP_API_URL` to point to your backend.

API endpoints are configured in `src/config/api.js`.

## 🐛 Troubleshooting

### Development Issues

**Port 3000 already in use:**
```bash
# Kill the process
npx kill-port 3000
# Or use a different port
PORT=3001 npm start
```

**Module not found errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build failures:**
```bash
# Clear build cache
rm -rf build
npm run build
```

### Production Issues

**White screen after deployment:**
- Check browser console for errors
- Verify `REACT_APP_API_URL` is set correctly
- Ensure backend API is accessible

**Payment gateway not working:**
- Verify payment gateway credentials
- Check network tab for failed requests
- Ensure backend payment endpoints are configured

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API base URL | Yes |
| `REACT_APP_FRONTEND_URL` | Frontend URL (for redirects) | Yes |
| `REACT_APP_KHALTI_PUBLIC_KEY` | Khalti payment gateway key | For Khalti payments |
| `REACT_APP_ESEWA_MERCHANT_ID` | eSewa merchant ID | For eSewa payments |
| `NODE_ENV` | Environment (development/production) | Auto-set |
| `GENERATE_SOURCEMAP` | Generate source maps | No (false in prod) |

## 📚 Additional Documentation

- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [API Integration](API_INTEGRATION.md) - Backend API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues or questions:
- Create an issue in the repository
- Contact the development team

## 🎯 Roadmap

- [ ] Add unit tests with Jest
- [ ] Implement E2E tests with Cypress
- [ ] Add PWA support
- [ ] Implement real-time notifications
- [ ] Add multi-language support
- [ ] Enhance accessibility (WCAG 2.1 AA)

---

**Built with ❤️ using React, Tailwind CSS, and modern web technologies**
