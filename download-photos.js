import { Client } from '@replit/object-storage';
import fs from 'fs';
import path from 'path';

async function downloadPhotos() {
  try {
    const client = new Client();
    
    console.log('Connecting to object storage...');
    
    // Try different methods to list objects
    try {
      const objects = await client.list();
      console.log('Objects response:', objects);
      
      if (objects && Array.isArray(objects)) {
        console.log(`Found ${objects.length} objects`);
        for (const obj of objects) {
          console.log('Object key:', obj.key || obj);
        }
      } else if (objects) {
        console.log('Objects structure:', Object.keys(objects));
      }
    } catch (listError) {
      console.log('List error:', listError.message);
      
      // Try alternative approach - list with prefix
      try {
        const result = await client.list('');
        console.log('Alternative list result:', result);
      } catch (altError) {
        console.log('Alternative error:', altError.message);
      }
    }
    
  } catch (error) {
    console.error('Error accessing object storage:', error.message);
    console.error('Full error:', error);
  }
}

downloadPhotos();