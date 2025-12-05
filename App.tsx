import React, { useState, useEffect } from 'react';
import { TravelForm } from './components/TravelForm';
import { ResultView } from './components/ResultView';
import { FormState, CityGuideData } from './types';
import { generateCityGuide, generateCityImage, generateCityGallery } from './services/geminiService';
import { Plane } from 'lucide-react';

// Curated high-quality travel backgrounds (Unsplash)
const LANDING_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1499856871940-a09627c6d7db?q=80&w=2070&auto=format&fit=crop", // Paris / Europe
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop", // Paris
  "https://images.unsplash.com/photo-1533929736472-594e45aa8616?q=80&w=2070&auto=format&fit=crop", // Santorini
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1988&auto=format&fit=crop", // Tokyo
  "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=2070&auto=format&fit=crop", // New York
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1966&auto=format&fit=crop", // Venice
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2068&auto=format&fit=crop"  // Beach
];

const App: React.FC = () => {
  const [data, setData] = useState<CityGuideData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState(0);

  // Rotate background images
  useEffect(() => {
    if (data) return; // Stop rotation if showing results
    
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % LANDING_BACKGROUNDS.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [data]);

  const handleFormSubmit = async (formData: FormState) => {
    setLoading(true);
    setError(null);
    try {
      // Execute text generation and image generation in parallel
      const [guideData, imageUrl, galleryImages] = await Promise.all([
        generateCityGuide(formData.city, formData.country, formData.duration),
        generateCityImage(formData.city, formData.country),
        generateCityGallery(formData.city, formData.country)
      ]);
      
      // Combine results
      setData({ ...guideData, imageUrl, gallery: galleryImages });
    } catch (err) {
      console.error(err);
      setError("Failed to generate guide. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  // Dynamic background style based on state
  // If result exists, use the generated city image.
  // If no result, let the slideshow div handle it below.
  const appStyle = data?.imageUrl 
    ? { 
        backgroundImage: `url(${data.imageUrl})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } 
    : {};

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-700 ease-in-out relative overflow-hidden"
      style={appStyle}
    >
      {/* Landing Background Slideshow */}
      {!data && LANDING_BACKGROUNDS.map((bg, index) => (
        <div
          key={bg}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out z-0`}
          style={{ 
            backgroundImage: `url(${bg})`,
            opacity: index === bgIndex ? 1 : 0 
          }}
        />
      ))}
      
      {/* Landing Overlay - Darker to make text readable over photos */}
      {!data && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-0"></div>
      )}

      {/* Result Overlay */}
      {data?.imageUrl && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0"></div>
      )}

      {/* Navigation / Brand */}
      {!data && (
        <nav className="w-full bg-transparent py-6 px-6 relative z-10 animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/90 p-2 rounded-full shadow-lg backdrop-blur-sm">
                 <Plane className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white drop-shadow-md">TravelGenie</span>
            </div>
            <div className="hidden sm:flex gap-4 text-white/90 font-medium text-sm">
               <span className="hover:text-white cursor-pointer transition-colors">Destinations</span>
               <span className="hover:text-white cursor-pointer transition-colors">About</span>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {error && (
          <div className="max-w-xl mx-auto mt-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-2xl text-red-600 text-center animate-pulse shadow-lg">
            {error}
          </div>
        )}

        {!data ? (
          <div className="flex items-center justify-center min-h-[75vh] px-4">
            <div className="w-full relative z-10 animate-fade-in">
               <TravelForm onSubmit={handleFormSubmit} isLoading={loading} />
            </div>
          </div>
        ) : (
          <ResultView data={data} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      {!data && (
         <footer className="py-8 text-center text-white/70 text-sm relative z-10">
           <p>© {new Date().getFullYear()} TravelGenie. AI-Powered Travel Assistant.</p>
         </footer>
      )}
    </div>
  );
};

export default App;
