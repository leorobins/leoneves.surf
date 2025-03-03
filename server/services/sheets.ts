import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { type Brand, type Product } from '@shared/schema';

// Initialize Google Sheets client
let client: JWT;
try {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);
  client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
} catch (error) {
  console.error('Error initializing Google Sheets client:', error);
  throw error;
}

const sheets = google.sheets({ version: 'v4', auth: client });

/**
 * Syncs store data (brands and products) to Google Sheets
 * Uses a predefined sheet named 'store-data'
 */
export async function syncStoreData(brands: Brand[], products: Product[]) {
  try {
    // Use environment variable for spreadsheet ID if available
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID environment variable is not set');
    }

    console.log('Starting store data sync...');
    console.log('Found:', {
      brands: brands.length,
      products: products.length
    });

    // Create the values arrays for both brands and products
    const brandsValues = [
      ['Brand ID', 'Brand Name', 'Description', 'Image URL'], // Headers
      ...brands.map(brand => [
        brand.id,
        brand.name,
        brand.description || '',
        brand.image || ''
      ])
    ];

    const productsValues = [
      ['Product ID', 'Product Name', 'Description', 'Price', 'Stock', 'Brand ID', 'Image URL'], // Headers
      ...products.map(product => [
        product.id,
        product.name,
        product.description || '',
        product.price,
        product.stock,
        product.brandId,
        product.image || ''
      ])
    ];

    // Update both sections in a single batch update
    const requests = [
      {
        range: 'store-data!A1:D' + (brands.length + 1),
        values: brandsValues
      },
      {
        range: 'store-data!F1:L' + (products.length + 1),
        values: productsValues
      }
    ];

    console.log('Sending batch update to Google Sheets...');
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: requests
      }
    });

    console.log('Successfully synced data to Google Sheets');
    return true;
  } catch (error) {
    console.error('Failed to sync with Google Sheets:', error);
    if (error instanceof Error) {
      console.error({
        message: error.message,
        stack: error.stack
      });
    }
    return false;
  }
}