import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2000&q=80',
      title: 'Autumn Collection 2025',
      description: 'Discover timeless pieces for the new season',
      gradient: 'from-neutral-900 to-neutral-900/70',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80',
      title: 'Designer Essentials',
      description: 'Elevate your wardrobe with premium fashion',
      gradient: 'from-neutral-900 to-neutral-900/70',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80',
      title: 'Street Style Edit',
      description: 'Urban fashion for the modern lifestyle',
      gradient: 'from-neutral-900 to-neutral-900/70',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2000&q=80',
      title: 'Limited Edition',
      description: 'Exclusive pieces from our latest collection',
      gradient: 'from-neutral-900 to-neutral-900/70',
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[800px] overflow-hidden">
      {/* Navigation Controls */}

      {/* Slides */}
      <div className="relative z-10 w-full h-full">
        {/* Background Slides */}
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover brightness-[0.85]"
              />
            </div>
          ))}
        </div>

        {/* Content Layer */}
        <div className="relative z-102 h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 flex items-center transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="container mx-auto px-16 md:px-28 lg:px-36">
                <div className="max-w-2xl text-white">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-light mb-4 md:mb-6 animate-fade-in tracking-tight drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-sm md:text-lg lg:text-xl mb-6 md:mb-8 animate-fade-in-delay font-light tracking-wide text-white/90 drop-shadow-md">
                    {slide.description}
                  </p>
                  <button 
                    onClick={() => navigate('/products')}
                    className="group relative isolate inline-flex items-center justify-center bg-white px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-medium tracking-wide cursor-pointer select-none overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in-delay-2 active:transform active:scale-[0.98]"
                  >
                    <span className="relative z-[2] text-gray-900 transition-colors duration-300 group-hover:text-white">
                      Explore Collection
                    </span>
                    <div 
                      className="absolute inset-0 z-[1] bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-0 z-20 flex items-center justify-between px-4 md:px-8 lg:px-12">
        <button
          onClick={prevSlide}
          className="p-2 md:p-3 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 md:h-8 md:w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="p-2 md:p-3 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 md:h-8 md:w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>


    </div>
  );
};

export default HeroSection;