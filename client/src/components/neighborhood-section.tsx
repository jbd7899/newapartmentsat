export default function NeighborhoodSection() {
  const neighborhoods = [
    {
      name: "Midtown Atlanta",
      description: "Arts district with galleries, restaurants, and easy transit access",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "Urban street view with young professionals"
    },
    {
      name: "Deep Ellum, Dallas",
      description: "Historic entertainment district with live music and trendy eateries",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "Modern downtown skyline"
    },
    {
      name: "Virginia-Highland",
      description: "Walkable neighborhood with boutique shops and charming cafes",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "Tree-lined residential street"
    },
    {
      name: "Bishop Arts, Dallas",
      description: "Creative enclave with independent shops and award-winning restaurants",
      image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "Trendy coffee shop district"
    },
    {
      name: "Inman Park",
      description: "Historic charm meets modern amenities with excellent dining",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "Urban park with city view"
    },
    {
      name: "Uptown Dallas",
      description: "Sophisticated district with upscale shopping and nightlife",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "Modern mixed-use development"
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Vibrant Neighborhoods</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our properties are located in the heart of the most dynamic and culturally rich areas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {neighborhoods.map((neighborhood, index) => (
            <div key={index} className="text-center group">
              <div className="overflow-hidden rounded-xl mb-4">
                <img
                  src={neighborhood.image}
                  alt={neighborhood.alt}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{neighborhood.name}</h3>
              <p className="text-gray-600">{neighborhood.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
