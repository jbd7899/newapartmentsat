import { Pool } from '@neondatabase/serverless';
import fetch from 'node-fetch';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function updatePropertyCoordinates() {
  try {
    console.log('Fetching all properties...');
    
    // Get all properties
    const result = await pool.query('SELECT id, address, city, state FROM properties ORDER BY id');
    const properties = result.rows;
    
    console.log(`Found ${properties.length} properties to update`);
    
    for (const property of properties) {
      const fullAddress = `${property.address}, ${property.city}, ${property.state}`;
      console.log(`\nGeocoding: ${fullAddress}`);
      
      try {
        // Call Google Maps Geocoding API
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.GOOGLE_API_KEY}`;
        
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const lat = location.lat.toFixed(5); // 5 decimal places
          const lng = location.lng.toFixed(5); // 5 decimal places
          
          console.log(`  Found coordinates: ${lat}, ${lng}`);
          
          // Update the property in the database
          await pool.query(
            'UPDATE properties SET latitude = $1, longitude = $2 WHERE id = $3',
            [lat, lng, property.id]
          );
          
          console.log(`  ✓ Updated property ${property.id}`);
        } else {
          console.log(`  ✗ Geocoding failed for property ${property.id}: ${data.status}`);
          if (data.error_message) {
            console.log(`    Error: ${data.error_message}`);
          }
        }
        
        // Add a small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  ✗ Error geocoding property ${property.id}:`, error.message);
      }
    }
    
    console.log('\n✓ Coordinate update process completed');
    
    // Show updated results
    console.log('\nUpdated coordinates:');
    const updatedResult = await pool.query('SELECT id, name, address, city, latitude, longitude FROM properties ORDER BY id');
    console.table(updatedResult.rows);
    
  } catch (error) {
    console.error('Error updating coordinates:', error);
  } finally {
    await pool.end();
  }
}

// Run the update
updatePropertyCoordinates();