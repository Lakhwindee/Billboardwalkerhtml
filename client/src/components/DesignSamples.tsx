import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type DesignSample } from "@shared/schema";

export default function DesignSamples() {
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch design samples from database
  const { data: designSamples = [], isLoading } = useQuery<DesignSample[]>({
    queryKey: ["/api/design-samples"],
  });

  // Filter active design samples
  const activeSamples = designSamples.filter(sample => sample.isActive);
  
  // Get unique categories
  const categories = ["all", ...Array.from(new Set(activeSamples.map(sample => sample.category)))];
  
  // Filter samples by category
  const filteredSamples = activeCategory === "all" 
    ? activeSamples 
    : activeSamples.filter(sample => sample.category === activeCategory);

  // Category display names
  const categoryDisplayNames: { [key: string]: string } = {
    all: "All Designs",
    business: "Business",
    event: "Events", 
    personal: "Personal",
    brand: "Brand"
  };

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            ✨ Design Inspiration
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
            Promotion Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Samples</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            See how your promotions will look on bottles. Here are various design samples that will help you 
            choose the right option for your brand.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
              data-testid={`button-category-${category}`}
            >
              {categoryDisplayNames[category] || category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        )}

        {/* Design Samples Grid */}
        {!isLoading && (
          <>
            {filteredSamples.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                {filteredSamples.map((sample) => (
                  <div
                    key={sample.id}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                    data-testid={`card-design-${sample.id}`}
                  >
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={sample.imageUrl}
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        data-testid={`img-design-${sample.id}`}
                      />
                      {/* Overlay with category badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {categoryDisplayNames[sample.category] || sample.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 
                        className="text-lg font-bold text-gray-900 mb-2"
                        data-testid={`text-title-${sample.id}`}
                      >
                        {sample.title}
                      </h3>
                      {sample.description && (
                        <p 
                          className="text-gray-600 text-sm leading-relaxed"
                          data-testid={`text-description-${sample.id}`}
                        >
                          {sample.description}
                        </p>
                      )}
                    </div>

                    {/* Hover Effect Border */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-300 rounded-2xl transition-all duration-300"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-6">🎨</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No Design Samples Found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  No design samples are available in this category yet. Please check other categories.
                </p>
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        {filteredSamples.length > 0 && (
          <div className="text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg inline-block">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Create Your Design?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Get inspired by these samples and create your unique promotion design
              </p>
              <a
                href="#contact"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 inline-block transform hover:scale-105"
                data-testid="button-start-creating"
              >
                Start Now 🚀
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}