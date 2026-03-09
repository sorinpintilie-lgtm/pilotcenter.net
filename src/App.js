import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import RouteSeoMeta from './components/RouteSeoMeta';
import Home from './pages/Home';
import './App.css';

const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const BecomePilot = lazy(() => import('./pages/BecomePilot'));
const FAARoute = lazy(() => import('./pages/FAARoute'));
const EASARoute = lazy(() => import('./pages/EASARoute'));
const ICAORoute = lazy(() => import('./pages/ICAORoute'));
const Costs = lazy(() => import('./pages/Costs'));
const FlightSchools = lazy(() => import('./pages/FlightSchools'));
const PilotJobs = lazy(() => import('./pages/PilotJobs'));
const PilotJobDetail = lazy(() => import('./pages/PilotJobDetail'));
const PilotJobsLogs = lazy(() => import('./pages/PilotJobsLogs'));
const News = lazy(() => import('./pages/News'));
const NewsArticle = lazy(() => import('./pages/NewsArticle'));
const AdminNewsDashboard = lazy(() => import('./pages/AdminNewsDashboard'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const FlightSchoolDetail = lazy(() => import('./pages/FlightSchoolDetail'));
const CountriesPage = lazy(() => import('./pages/CountriesPage'));
const CountryDetailPage = lazy(() => import('./pages/CountryDetailPage'));
const HowToBecomePilotCountryPage = lazy(() => import('./pages/HowToBecomePilotCountryPage'));
const ConsultationBooking = lazy(() => import('./pages/ConsultationBooking'));
const CalendarBooking = lazy(() => import('./pages/CalendarBooking'));

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="page">
        <RouteSeoMeta />
        <Header />
        <main>
          <ScrollToTop>
            <Suspense fallback={<div className="route-loading">Loading page…</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about-us" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/how-to-become-a-pilot" element={<BecomePilot />} />
                <Route path="/the-faa-route" element={<FAARoute />} />
                <Route path="/the-easa-route" element={<EASARoute />} />
                <Route path="/the-icao-route" element={<ICAORoute />} />
                <Route path="/cost-breakdown" element={<Costs />} />
                <Route path="/flightschools" element={<FlightSchools />} />
                <Route path="/flightschools/:slug" element={<FlightSchoolDetail />} />
                <Route path="/schools" element={<FlightSchools />} />
                <Route path="/schools/:slug" element={<FlightSchoolDetail />} />
                <Route path="/latest-pilot-jobs" element={<PilotJobs />} />
                <Route path="/latest-pilot-jobs/:slug" element={<PilotJobDetail />} />
                <Route path="/latest-pilot-jobs/logs" element={<PilotJobsLogs />} />
                <Route path="/news-and-resources" element={<News />} />
                <Route path="/news-and-resources/:slug" element={<NewsArticle />} />
                <Route path="/admin" element={<AdminNewsDashboard />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/countries" element={<CountriesPage />} />
                <Route path="/countries/:countrySlug" element={<CountryDetailPage />} />
                <Route path="/how-to-become-a-pilot-in/:slug" element={<HowToBecomePilotCountryPage />} />
                <Route path="/consultation-booking" element={<ConsultationBooking />} />
                <Route path="/calendar-booking" element={<CalendarBooking />} />
              </Routes>
            </Suspense>
          </ScrollToTop>
        </main>
        <Footer />
      </div>
    </Router>
  </HelmetProvider>
);
}

export default App;
