import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Browse = lazy(() => import('./pages/Browse'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const SubmitEvent = lazy(() => import('./pages/SubmitEvent'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminSignup = lazy(() => import('./pages/AdminSignup'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TicketSuccess = lazy(() => import('./pages/TicketSuccess'));
const PurchaseTicket = lazy(() => import('./pages/PurchaseTicket'));

const AppShell = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-habesha-white text-charcoal">
      <main className="flex-grow">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          {!isAdminRoute && <Navbar key={location.pathname} />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/purchase" element={<PurchaseTicket />} />
            <Route path="/submit" element={<SubmitEvent />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/ticket-success" element={<TicketSuccess />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Router>
          <AppShell />
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
