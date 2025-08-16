
import { useQuery } from "@tanstack/react-query";
import { type DesignSample } from "@shared/schema";

export default function Designs() {
  // Fetch design samples from database
  const { data: designSamples = [], isLoading } = useQuery<DesignSample[]>({
    queryKey: ["/api/design-samples"],
  });

  // Filter active design samples
  const activeSamples = designSamples.filter(sample => sample.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-4">
                <img 
                  src="https://via.placeholder.com/60x60/ff6b6b/ffffff?text=IB"
                  alt="IamBillBoard Logo" 
                  className="w-15 h-15 object-contain filter drop-shadow-lg"
                />
                <div className="flex flex-col">
                  <div className="text-2xl font-black bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent tracking-wider leading-tight" style={{fontFamily: 'Playfair Display, serif'}}>
                    IamBillboard
                  </div>
                </div>
              </a>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <a href="/" className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300">
                Home
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Gallery</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Designs Grid Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-2xl font-semibold text-gray-700">Loading designs...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && activeSamples.length === 0 && (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-6xl">🎨</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No Designs Available Yet</h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Amazing designs are coming soon!
              </p>
            </div>
          )}

          {/* Large Promotional Images Grid */}
          {!isLoading && activeSamples.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeSamples.map((sample, index) => (
                <div 
                  key={sample.id} 
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                  data-testid={`card-design-sample-${sample.id}`}
                >
                  {/* Large Image Container */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <img
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading={index < 6 ? "eager" : "lazy"}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}