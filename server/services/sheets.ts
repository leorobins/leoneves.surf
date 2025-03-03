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
 */
export async function syncStoreData(brands: Brand[], products: Product[]) {
  try {
    if (!process.env.SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID environment variable is not set');
    }

    console.log('Starting store data sync...');

    // Combine all data into a single array
    const allData = [
      // Headers
      ['Store Data - Updated: ' + new Date().toLocaleString()],
      [''],
      ['Brands'],
      ['ID', 'Name', 'Description', 'Image URL'],
      // Brands data
      ...brands.map(brand => [
        brand.id,
        brand.name,
        brand.description || '',
        brand.image || ''
      ]),
      [''],  // Empty row for separation
      ['Products'],
      ['ID', 'Name', 'Description', 'Price', 'Stock', 'Brand ID', 'Image URL'],
      // Products data
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

    console.log('Preparing to write data:', {
      totalRows: allData.length,
      brandsCount: brands.length,
      productsCount: products.length
    });

    // Write all data in a single update
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'store-data!A1',  // Start at A1, will expand as needed
      valueInputOption: 'RAW',
      requestBody: {
        values: allData
      }
    });

    console.log('Sheets API Response:', response.data);
    console.log('Successfully synced data to Google Sheets');
    return true;
  } catch (error) {
    console.error('Failed to sync with Google Sheets:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;  // Re-throw to handle in routes
  }
}