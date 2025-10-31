import HeroSection from '../components/HeroSection';
import TopProducts from '../components/TopProducts';
import MenSection from '../components/MenSection';
import FemaleSection from '../components/FemaleSection';
import '../components/HeroSection.css';

const Home = () => {
  return (
    <div>
      <HeroSection />
      <TopProducts />
      <MenSection />
      <FemaleSection />
    </div>
  );
};

export default Home;