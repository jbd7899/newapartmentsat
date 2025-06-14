import { db } from "./db";
import { properties } from "@shared/schema";
import { eq } from "drizzle-orm";

interface GeocodeResult {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
  error_message?: string;
}

async function updateAllPropertyCoordinates() {
  try {
    console.log('Starting coordinate update process...');
    
    // Get all properties
    const allProperties = await db.select().from(properties);
    console.log(`Found ${allProperties.length} properties to update`);
    
    for (const property of allProperties) {
      const fullAddress = `${property.address}, ${property.city}, ${property.state}`;
      console.log(`\nGeocoding: ${fullAddress}`);
      
      try {
        // Call Google Maps Geocoding API
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.GOOGLE_API_KEY}`;
        
        const response = await fetch(geocodeUrl);
        const data: GeocodeResult = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const lat = location.lat.toFixed(5); // 5 decimal places
          const lng = location.lng.toFixed(5); // 5 decimal places
          
          console.log(`  Found coordinates: ${lat}, ${lng}`);
          
          // Update the property in the database
          await db
            .update(properties)
            .set({
              latitude: lat,
              longitude: lng
            })
            .where(eq(properties.id, property.id));
          
          console.log(`  ✓ Updated property ${property.id}: ${property.name}`);
        } else {
          console.log(`  ✗ Geocoding failed for property ${property.id}: ${data.status}`);
          if (data.error_message) {
            console.log(`    Error: ${data.error_message}`);
          }
        }
        
        // Add a small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`  ✗ Error geocoding property ${property.id}:`, error);
      }
    }
    
    console.log('\n✓ Coordinate update process completed');
    
    // Show updated results
    console.log('\nUpdated coordinates:');
    const updatedProperties = await db.select({
      id: properties.id,
      name: properties.name,
      address: properties.address,
      city: properties.city,
      latitude: properties.latitude,
      longitude: properties.longitude
    }).from(properties);
    
    console.table(updatedProperties);
    
  } catch (error) {
    console.error('Error updating coordinates:', error);
  }
}

export { updateAllPropertyCoordinates };