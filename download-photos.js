import { Client } from '@replit/object-storage';
import fs from 'fs';
import path from 'path';

// Property name mapping from object storage to database
const propertyMapping = {
  '1015Cameron': 'dallas-1015-cameron-avenue',
  '1031Lanier': 'atlanta-1031-lanier-boulevard', 
  '1900Lucille': 'dallas-1900-lucille-avenue',
  '253-14thSt': 'atlanta-253-14th-street-apartments',
  '290-8thSt': 'atlanta-290-8th-street-apartments',
  '4417Sycamore': 'dallas-4417-sycamore-street',
  '4806LiveOak': 'dallas-4806-live-oak-street',
  '5501Winton': 'dallas-5501-winton-street',
  '5503Winton': 'dallas-5503-winton-street',
  '615Parkview': 'dallas-615-parkview-avenue',
  '6212Martel': 'dallas-6212-martel-avenue',
  '6236Winton': 'dallas-6236-winton-street',
  '6463Trammel': 'dallas-6463-trammel-drive',
  '6646ELovers': 'dallas-6646-e-lovers-lane',
  '717Argonne': 'atlanta-717-argonne-avenue',
  '718Argonne': 'atlanta-718-argonne-avenue',
  '721Argonne': 'atlanta-721-argonne-avenue',
  '769Argonne': 'atlanta-769-argonne-avenue',
  '823Greenwood': 'atlanta-823-greenwood-avenue',
  '869StCharles': 'atlanta-869-st-charles-avenue',
  '903Myrtle': 'atlanta-903-myrtle-street',
  '915Grigsby': 'dallas-915-grigsby-avenue',
  '965Myrtle': 'atlanta-965-myrtle-street'
};

async function downloadPhotos() {
  try {
    const client = new Client();
    console.log('Connecting to object storage...');
    
    const result = await client.list();
    const objects = result.value || [];
    
    console.log(`Found ${objects.length} total objects`);
    
    // Filter for image files only
    const imageFiles = objects.filter(obj => 
      obj.name.match(/\.(jpg|jpeg|png|webp)$/i) && !obj.name.endsWith('/')
    );
    
    console.log(`Found ${imageFiles.length} image files to download`);
    
    let downloadCount = 0;
    let skipCount = 0;
    
    for (const fileObj of imageFiles) {
      const objKey = fileObj.name;
      console.log(`Processing: ${objKey}`);
      
      // Parse the object key to determine property and unit
      const pathParts = objKey.split('/');
      const propertyName = pathParts[0];
      const fileName = pathParts[pathParts.length - 1];
      
      // Map to our property folder structure
      const mappedProperty = propertyMapping[propertyName];
      if (!mappedProperty) {
        console.log(`Skipping unknown property: ${propertyName}`);
        skipCount++;
        continue;
      }
      
      let targetPath;
      
      if (pathParts.length === 2) {
        // Property-level photo
        targetPath = `photos/properties/${mappedProperty}/property-exterior/${fileName}`;
      } else if (pathParts.length === 3) {
        // Unit photo
        const unitFolder = pathParts[1].toLowerCase().replace(/[^a-z0-9]/g, '-');
        targetPath = `photos/properties/${mappedProperty}/unit-${unitFolder}/${fileName}`;
      } else {
        console.log(`Skipping complex path: ${objKey}`);
        skipCount++;
        continue;
      }
      
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Skip if file already exists
      if (fs.existsSync(targetPath)) {
        console.log(`File already exists: ${targetPath}`);
        skipCount++;
        continue;
      }
      
      try {
        // Download the file using the correct method
        const fileData = await client.downloadAsBytes(objKey);
        
        if (fileData && fileData.ok && fileData.value) {
          // Convert array to buffer if needed
          let buffer;
          if (Array.isArray(fileData.value)) {
            buffer = Buffer.from(fileData.value);
          } else {
            buffer = fileData.value;
          }
          
          // Write to local file system
          fs.writeFileSync(targetPath, buffer);
          console.log(`✓ Downloaded: ${targetPath}`);
          downloadCount++;
        } else {
          console.log(`✗ Failed to download: ${objKey} (no data)`);
          skipCount++;
        }
      } catch (downloadError) {
        console.log(`✗ Failed to download: ${objKey} - ${downloadError.message}`);
        skipCount++;
      }
    }
    
    console.log('\n=== Download Summary ===');
    console.log(`Total files processed: ${imageFiles.length}`);
    console.log(`Successfully downloaded: ${downloadCount}`);
    console.log(`Skipped/Failed: ${skipCount}`);
    console.log('Photo download complete!');
    
  } catch (error) {
    console.error('Error downloading photos:', error.message);
    console.error('Full error:', error);
  }
}

downloadPhotos();