import React, { useState, useEffect, useRef } from 'react';
import { CityGuideData } from '../types';
import { Sun, Map as MapIcon, Compass, Info, Clock, Thermometer, Briefcase, Star, Layout, Image as ImageIcon, LocateFixed, ArrowLeft, Layers, Globe } from 'lucide-react';

interface ResultViewProps {
  data: CityGuideData;
  onReset: () => void;
}

type TabType = 'weather' | 'attractions' | 'map' | 'itinerary' | 'tips' | 'photos';
type MapStyle = 'street' | 'satellite';

export const ResultView: React.FC<ResultViewProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<TabType>('weather');
  const [mapStyle, setMapStyle] = useState<MapStyle>('street');
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<any>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (activeTab === 'map' && mapContainerRef.current) {
      const L = (window as any).L;
      if (!L) return;

      // Ensure coordinates exist before initializing map
      if (!data.coordinates || typeof data.coordinates.lat !== 'number' || typeof data.coordinates.lng !== 'number') {
        return;
      }

      if (!mapRef.current) {
        // Initialize Map only once
        const map = L.map(mapContainerRef.current, {
          zoomControl: false, 
        }).setView([data.coordinates.lat, data.coordinates.lng], 13);
        
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapRef.current = map;

        // Add Markers
        const createCustomIcon = (color: string) => {
          return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="
              background-color: ${color};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          });
        };

        const cityIcon = createCustomIcon('#3b82f6'); 
        const attractionIcon = createCustomIcon('#f43f5e'); 

        // City Center
        const cityMarker = L.marker([data.coordinates.lat, data.coordinates.lng], { icon: cityIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-4 min-w-[200px]">
              <h3 class="font-bold text-gray-900 text-lg mb-1">${data.city}</h3>
              <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide">City Center</p>
            </div>
          `);
          
        setTimeout(() => cityMarker.openPopup(), 500);

        // Attractions
        if (data.attractions && Array.isArray(data.attractions)) {
          data.attractions.forEach((attr) => {
            if (attr.coordinates && typeof attr.coordinates.lat === 'number' && typeof attr.coordinates.lng === 'number') {
              L.marker([attr.coordinates.lat, attr.coordinates.lng], { icon: attractionIcon })
                .addTo(map)
                .bindPopup(`
                  <div class="p-4 max-w-[240px]">
                    <h3 class="font-bold text-gray-900 mb-2">${attr.name}</h3>
                    <p class="text-sm text-gray-600 leading-snug">${attr.benefit}</p>
                  </div>
                `);
            }
          });
        }
      }

      // Handle Layer Switching
      const L_Local = (window as any).L;
      if (layerRef.current) {
        layerRef.current.remove();
      }

      if (mapStyle === 'street') {
        layerRef.current = L_Local.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(mapRef.current);
      } else {
        layerRef.current = L_Local.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19
        }).addTo(mapRef.current);
      }
    }
  }, [activeTab, data, mapStyle]);

  useEffect(() => {
     return () => {
        if (activeTab !== 'map' && mapRef.current) {
           mapRef.current.remove();
           mapRef.current = null;
        }
     }
  }, [activeTab]);


  const handleRecenter = () => {
    if (mapRef.current && data.coordinates) {
      mapRef.current.setView([data.coordinates.lat, data.coordinates.lng], 13, {
        animate: true,
        duration: 1.5
      });
    }
  };

  const jumpToMap = (lat: number, lng: number) => {
    setActiveTab('map');
    // Need a small timeout to allow the map container to render and map to initialize
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 15, {
            animate: true,
            duration: 1.5
        });
      }
    }, 100);
  };

  const renderTabButton = (id: TabType, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-300 rounded-xl ${
        activeTab === id
          ? 'bg-gray-900 text-white shadow-lg transform scale-105'
          : 'bg-white/50 text-gray-600 hover:bg-white/80 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 pb-12 pt-6">
      <button 
        onClick={onReset}
        className="mb-6 flex items-center gap-2 text-white bg-black/30 hover:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/20 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Search
      </button>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden">
        
        {/* Header Content */}
        <div className="pt-10 pb-8 px-8 text-center border-b border-gray-100/50">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-2 tracking-tight">{data.city}</h1>
          <p className="text-xl text-gray-500 font-medium uppercase tracking-[0.2em]">{data.country}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-4 overflow-x-auto">
          <div className="flex gap-3 min-w-max md:justify-center">
            {renderTabButton('weather', 'Overview', <Sun className="w-4 h-4" />)}
            {renderTabButton('photos', 'Photos', <ImageIcon className="w-4 h-4" />)}
            {renderTabButton('attractions', 'Attractions', <Star className="w-4 h-4" />)}
            {renderTabButton('map', 'Map', <MapIcon className="w-4 h-4" />)}
            {renderTabButton('itinerary', 'Itinerary', <Clock className="w-4 h-4" />)}
            {renderTabButton('tips', 'Tips', <Info className="w-4 h-4" />)}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8 md:p-12 bg-white/40 min-h-[500px]">
          
          {/* Overview & Weather Tab */}
          {activeTab === 'weather' && (
            <div className="animate-fade-in space-y-10">
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to {data.city}</h3>
                <p className="text-gray-700 leading-loose text-lg font-light">{data.introduction}</p>
              </div>

              {data.weather ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                        <Sun className="h-8 w-8" />
                        <h3 className="text-2xl font-bold">Weather</h3>
                      </div>
                      <div className="flex items-baseline gap-4 mb-2">
                        <span className="text-5xl font-bold">{data.weather.temperature || "N/A"}</span>
                        <span className="text-xl opacity-90">{data.weather.condition || "Unknown"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4 text-indigo-600">
                        <Briefcase className="h-6 w-6" />
                        <h3 className="text-xl font-bold">Packing Essentials</h3>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed italic">"{data.weather.packingSuggestion || "Check local forecasts."}"</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-100">
                  <p>Weather information is currently unavailable.</p>
                </div>
              )}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <ImageIcon className="text-pink-500" />
                Gallery
              </h3>
              {data.gallery && data.gallery.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Main Header Image Repurposed */}
                   {data.imageUrl && (
                      <div className="md:col-span-2 h-80 rounded-2xl overflow-hidden shadow-lg group relative">
                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                           <span className="text-white font-medium">Iconic View</span>
                         </div>
                        <img src={data.imageUrl} alt={data.city} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                   )}
                   {data.gallery.map((img, idx) => (
                     <div key={idx} className="h-64 rounded-2xl overflow-hidden shadow-lg group relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                           <span className="text-white font-medium">Gallery Image {idx + 1}</span>
                         </div>
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No gallery images generated yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Attractions Tab */}
          {activeTab === 'attractions' && (
            <div className="animate-fade-in">
               <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Star className="text-yellow-500 fill-yellow-500" />
                Top Attractions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.attractions && data.attractions.length > 0 ? (
                  data.attractions.map((attraction, idx) => (
                    <div key={idx} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-xl text-gray-800 group-hover:text-indigo-600 transition-colors">{attraction.name}</h4>
                          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">#{idx + 1}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">{attraction.benefit}</p>
                      </div>
                      
                      {attraction.coordinates && (
                        <button 
                          onClick={() => jumpToMap(attraction.coordinates.lat, attraction.coordinates.lng)}
                          className="flex items-center text-xs text-indigo-600 gap-1 bg-indigo-50 w-fit px-3 py-2 rounded-md hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          <MapIcon className="w-3 h-3" />
                          <span>View on Map</span>
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                   <p className="text-gray-500">No attractions information available.</p>
                )}
              </div>
            </div>
          )}

          {/* Map Tab */}
          {activeTab === 'map' && (
            <div className="animate-fade-in space-y-6 h-full flex flex-col">
               <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3 text-indigo-800">
                    <Compass className="h-5 w-5" />
                    <h3 className="font-bold">Geography & Layout</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{data.mapContext || "Map details unavailable."}</p>
               </div>
               
               <div className="relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                 {data.coordinates ? (
                   <>
                     <div ref={mapContainerRef} className="h-full w-full z-0 outline-none" id="map-container"></div>
                     
                     {/* Map Controls */}
                     <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                       <button
                          onClick={handleRecenter}
                          className="bg-white text-gray-700 hover:text-indigo-600 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 group"
                          title="Re-center Map"
                       >
                         <LocateFixed className="w-6 h-6 group-hover:scale-110 transition-transform" />
                       </button>
                       
                       <button
                          onClick={() => setMapStyle(prev => prev === 'street' ? 'satellite' : 'street')}
                          className="bg-white text-gray-700 hover:text-indigo-600 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 group"
                          title="Toggle Satellite View"
                       >
                         {mapStyle === 'street' ? (
                           <Globe className="w-6 h-6 group-hover:scale-110 transition-transform" />
                         ) : (
                           <Layers className="w-6 h-6 group-hover:scale-110 transition-transform" />
                         )}
                       </button>
                     </div>
                     
                     {/* Map overlay gradient for integration */}
                     <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-[400]"></div>
                   </>
                 ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                       <p>Map coordinates unavailable.</p>
                    </div>
                 )}
               </div>
            </div>
          )}

          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Layout className="text-purple-500" />
                {data.itinerary && data.itinerary.length > 1 ? `${data.itinerary.length}-Day Itinerary` : 'Perfect Day Itinerary'}
              </h3>
              
              <div className="space-y-12">
                {data.itinerary && data.itinerary.length > 0 ? (
                  data.itinerary.map((dayPlan, dayIdx) => (
                    <div key={dayIdx} className="relative">
                      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white/60 backdrop-blur-md p-2 rounded-xl z-10 border border-white/40 shadow-sm">
                        <span className="bg-purple-600 text-white font-bold px-4 py-2 rounded-lg shadow-md">Day {dayPlan.day}</span>
                        <h4 className="text-xl font-bold text-gray-800">{dayPlan.theme}</h4>
                      </div>
                      
                      <div className="space-y-6 pl-4 border-l-2 border-purple-100 ml-4">
                        {dayPlan.activities.map((item, idx) => (
                          <div key={idx} className="flex group relative">
                            <div className="absolute -left-[25px] mt-1.5 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-white shadow-sm"></div>
                            
                            <div className="w-full">
                              <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold mb-2 shadow-sm border border-purple-100">
                                {item.time}
                              </span>
                              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
                                  <p className="text-gray-700 font-medium text-lg">{item.activity}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                   <p className="text-gray-500">No itinerary generated.</p>
                )}
              </div>
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Info className="text-teal-500" />
                Local Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.localTips && data.localTips.length > 0 ? (
                  data.localTips.map((tip, idx) => (
                    <div key={idx} className="bg-teal-50/50 rounded-2xl p-8 border border-teal-100/50 hover:bg-teal-50 transition-all duration-300">
                      <h4 className="font-bold text-teal-800 mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                        {tip.category}
                      </h4>
                      <p className="text-gray-800 text-lg font-medium italic leading-relaxed">"{tip.tip}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No local tips available.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};