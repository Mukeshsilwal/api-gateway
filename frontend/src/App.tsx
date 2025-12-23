import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROLES } from "./services/authService";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingFallback from "./components/LoadingFallback";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AnalyticsObserver from "./components/AnalyticsObserver";
import { initAnalytics } from "./services/analytics";
import AIChatbot from "./components/chatbot/AIChatbot";

// Lazy load components for code splitting
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const SuperAdminLogin = lazy(() => import("./pages/SuperAdminLogin"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Register = lazy(() => import("./pages/register"));
const UserLogin = lazy(() => import("./pages/UserLogin"));
const UserRegister = lazy(() => import("./pages/UserRegister"));
const HomePage = lazy(() => import("./pages/Homepage"));
const BusList = lazy(() => import("./pages/BusList"));
const TicketDetails = lazy(() => import("./pages/ticketDetails"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const TicketConfirmed = lazy(() => import("./pages/ticketconfirm"));
const AdminPanel = lazy(() => import("./pages/admin").then(module => ({ default: module.AdminPanel })));
const PlaneList = lazy(() => import("./pages/PlaneList"));
const PlaneSeatSelection = lazy(() => import("./pages/PlaneSeatSelection"));
const PlaneTicketConfirm = lazy(() => import("./pages/PlaneTicketConfirm"));
const QfxMovies = lazy(() => import("./pages/QfxMovies"));
const QfxMovieDetails = lazy(() => import("./pages/QfxMovieDetails"));
const QfxSeatSelection = lazy(() => import("./pages/QfxSeatSelection"));
const QfxBookingConfirmation = lazy(() => import("./pages/QfxBookingConfirmation"));

// Hotel Routes
const HotelList = lazy(() => import("./pages/HotelList"));
const HotelDetail = lazy(() => import("./pages/HotelDetail"));
const HotelBooking = lazy(() => import("./pages/HotelBooking"));
const HotelBookingConfirmation = lazy(() => import("./pages/HotelBookingConfirmation"));
const NearbyHotels = lazy(() => import("./pages/NearbyHotels"));
const AddHotelPage = lazy(() => import("./pages/AddHotelPage").then(module => ({ default: module.AddHotelPage })));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));
const PaymentStatus = lazy(() => import("./pages/PaymentStatus"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const PaymentRedirect = lazy(() => import("./pages/PaymentRedirect"));
const BusBooking = lazy(() => import("./pages/BusBooking"));
const BusBookingPage = lazy(() => import("./pages/BusBookingPage")); // NEW
const MarketPurchasePage = lazy(() => import("./pages/MarketPurchasePage")); // NEW
const HotelBookingPage = lazy(() => import("./pages/HotelBookingPage")); // NEW

// Event Routes
const EventList = lazy(() => import("./pages/EventList"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const EventBooking = lazy(() => import("./pages/EventBooking").then(module => ({ default: module.EventBooking })));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation").then(module => ({ default: module.BookingConfirmation })));
const AddEventPage = lazy(() => import("./pages/AddEventPage").then(module => ({ default: module.AddEventPage })));
const EventCalendarPage = lazy(() => import("./pages/EventCalendarPage"));
const EventCheckInPage = lazy(() => import("./pages/EventCheckInPage"));
const EventTickets = lazy(() => import("./pages/EventTickets"));

const NotFound = lazy(() => import("./pages/NotFound"));
const EsewaDemo = lazy(() => import("./pages/EsewaDemo"));
const DashboardDemo = lazy(() => import("./components/DashboardDemo"));
const MarketDashboard = lazy(() => import("./pages/MarketDashboard"));
const MyBookings = lazy(() => import("./pages/MyBookings"));


const App: React.FC = () => {
  useEffect(() => {
    // Initialize Analytics on App Mount
    initAnalytics();
  }, []);

  return (
    <div className="App">
      <ErrorBoundary>
        <BrowserRouter>
          <AnalyticsObserver />
          <Suspense fallback={<LoadingFallback fullScreen message="Loading application..." />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} errorElement={<ErrorPage />} />
              <Route path="/home" element={<HomePage />} errorElement={<ErrorPage />} />

              {/* User Login Routes */}
              <Route path="/login" element={<UserLogin />} errorElement={<ErrorPage />} />
              <Route path="/register" element={<UserRegister />} errorElement={<ErrorPage />} />

              {/* Admin Login Routes */}
              <Route path="/admin/login" element={<AdminLogin />} errorElement={<ErrorPage />} />
              <Route path="/admin/register" element={<Register />} errorElement={<ErrorPage />} />

              {/* Super Admin Login Route */}
              <Route path="/super-admin/login" element={<SuperAdminLogin />} errorElement={<ErrorPage />} />

              {/* Booking Routes - Accessible to all authenticated users */}
              <Route
                path="/buslist"
                element={<BusList />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/ticket-details"
                element={<TicketDetails />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/ticket-confirm"
                element={<TicketConfirmed />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/payment/success"
                element={<PaymentSuccess />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/payment/callback"
                element={<PaymentCallback />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/payment/status"
                element={<PaymentStatus />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/payment/failed"
                element={<PaymentFailure />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/payment/redirect"
                element={<PaymentRedirect />}
                errorElement={<ErrorPage />}
              />

              {/* eSewa Callback Routes (matching backend configuration) */}
              <Route
                path="/payments/esewa/success"
                element={<PaymentSuccess />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/payments/esewa/failure"
                element={<PaymentFailure />}
                errorElement={<ErrorPage />}
              />

              {/* Plane Booking Routes */}
              <Route
                path="/plane-list"
                element={<PlaneList />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/plane-seats"
                element={<PlaneSeatSelection />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/plane-confirm"
                element={<PlaneTicketConfirm />}
                errorElement={<ErrorPage />}
              />

              {/* QFX Cinema Routes */}
              <Route
                path="/qfx/movies"
                element={<QfxMovies />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/qfx/movie/:id"
                element={<QfxMovieDetails />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/qfx/seats/:showtimeId"
                element={<QfxSeatSelection />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/qfx/confirmation"
                element={<QfxBookingConfirmation />}
                errorElement={<ErrorPage />}
              />

              {/* Hotel Routes */}
              <Route
                path="/hotels"
                element={<HotelList />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/hotels/:hotelId"
                element={<HotelDetail />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/hotel-booking"
                element={<HotelBooking />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/hotel-booking-confirmation"
                element={<HotelBookingConfirmation />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/nearby-hotels"
                element={<NearbyHotels />}
                errorElement={<ErrorPage />}
              />

              {/* Add Hotel Page - Admin Route */}
              <Route
                path="/add-hotel"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                    <AddHotelPage />
                  </ProtectedRoute>
                }
                errorElement={<ErrorPage />}
              />

              <Route
                path="/admin/panel"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
                errorElement={<ErrorPage />}
              />

              {/* Super Admin Panel Route */}
              <Route
                path="/super-admin/panel"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
                errorElement={<ErrorPage />}
              />

              {/* Event Routes */}
              <Route path="/events" element={<EventList />} errorElement={<ErrorPage />} />
              <Route path="/events/:eventId" element={<EventDetails />} errorElement={<ErrorPage />} />
              <Route path="/events/:eventId/book" element={<EventBooking />} errorElement={<ErrorPage />} />
              <Route path="/events/booking/:bookingReference/confirmation" element={<BookingConfirmation />} errorElement={<ErrorPage />} />
              <Route path="/events/booking/:bookingReference/tickets" element={<EventTickets />} errorElement={<ErrorPage />} />
              <Route path="/events/calendar" element={<EventCalendarPage />} errorElement={<ErrorPage />} />
              <Route
                path="/events/:eventId/check-in"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                    <EventCheckInPage />
                  </ProtectedRoute>
                }
                errorElement={<ErrorPage />}
              />

              {/* Add Event Page - Admin Route */}
              <Route
                path="/add-event"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                    <AddEventPage />
                  </ProtectedRoute>
                }
                errorElement={<ErrorPage />}
              />

              {/* Market Routes */}
              <Route path="/market" element={<MarketDashboard />} errorElement={<ErrorPage />} />
              <Route path="/market/dashboard/:eventId" element={<MarketDashboard />} errorElement={<ErrorPage />} />

              {/* User Routes */}
              <Route path="/my-bookings" element={<MyBookings />} errorElement={<ErrorPage />} />

              {/* Utility Routes */}
              <Route path="/esewa-demo" element={<EsewaDemo />} errorElement={<ErrorPage />} />
              <Route path="/dashboard-demo" element={<DashboardDemo />} errorElement={<ErrorPage />} />
              <Route path="/bus-booking-demo" element={<BusBooking />} errorElement={<ErrorPage />} />

              {/* NEW Aggregated Booking Routes */}
              <Route path="/bus-booking" element={<BusBookingPage />} errorElement={<ErrorPage />} />
              <Route path="/market-purchase" element={<MarketPurchasePage />} errorElement={<ErrorPage />} />
              <Route path="/hotel-booking" element={<HotelBookingPage />} errorElement={<ErrorPage />} />

              <Route
                path="/change-password"
                element={<ChangePassword />}
                errorElement={<ErrorPage />}
              />

              {/* Catch-all route for 404 errors - MUST BE LAST */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        {/* AI Chatbot - Floating widget available on all pages */}
        <AIChatbot />
      </ErrorBoundary>
    </div>
  );
}

export default App;
