import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import BecomePilot from './pages/BecomePilot';
import FAARoute from './pages/FAARoute';
import EASARoute from './pages/EASARoute';
import ICAORoute from './pages/ICAORoute';
import Costs from './pages/Costs';
import FlightSchools from './pages/FlightSchools';
import PilotJobs from './pages/PilotJobs';
import News from './pages/News';
import HowItWorks from './pages/HowItWorks';
import FlightSchoolDetail from './pages/FlightSchoolDetail';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import HowToBecomePilotCountryPage from './pages/HowToBecomePilotCountryPage';
import ConsultationBooking from './pages/ConsultationBooking';
import CalendarBooking from './pages/CalendarBooking';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="page">
        <Header />
        <main>
          <ScrollToTop>
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
              <Route path="/latest-pilot-jobs" element={<PilotJobs />} />
              <Route path="/news-and-resources" element={<News />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/countries" element={<CountriesPage />} />
              <Route path="/countries/:countrySlug" element={<CountryDetailPage />} />
              <Route path="/how-to-become-a-pilot-in/:slug" element={<HowToBecomePilotCountryPage />} />
              <Route path="/consultation-booking" element={<ConsultationBooking />} />
              <Route path="/calendar-booking" element={<CalendarBooking />} />
            </Routes>
          </ScrollToTop>
        </main>
        <Footer />
      </div>
    </Router>
  </HelmetProvider>
);
}

export default App;