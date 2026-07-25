import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import CategoriesSection from '../components/CategoriesSection.jsx';
import DemoCTA from '../components/DemoCTA.jsx';
import Footer from '../components/Footer.jsx';

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <CategoriesSection />
      <DemoCTA />
      <Footer />
    </div>
  );
}
