import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { type Brand, type Product } from '@shared/schema';

// Initialize Google Sheets client
let sheetsClient: ReturnType<typeof google.sheets>;

function initializeGoogleSheets() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    // Parse and validate service account credentials
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

      if (!credentials.client_email || !credentials.private_key) {
        throw new Error('Service account credentials missing required fields');
      }

      console.log('Successfully parsed service account credentials');
    } catch (parseError) {
      console.error('Failed to parse service account credentials:', parseError);
      throw new Error('Invalid service account credentials format');
    }

    // Create JWT client
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // Initialize sheets client
    sheetsClient = google.sheets({ version: 'v4', auth: client });
    console.log('Successfully initialized Google Sheets client');

    return true;
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    throw error;
  }
}

// Initialize on module load
initializeGoogleSheets();

/**
 * Syncs store data (brands and products) to Google Sheets
 */
export async function syncStoreData(brands: Brand[], products: Product[]) {
  try {
    if (!process.env.SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID environment variable is not set');
    }

    if (!sheetsClient) {
      throw new Error('Google Sheets client not initialized');
    }

    console.log('Starting store data sync...');
    console.log(`Using spreadsheet ID: ${process.env.SPREADSHEET_ID}`);
    console.log('Data to sync:', {
      brandsCount: brands.length,
      productsCount: products.length
    });

    // Prepare data to write
    const data = [
      ['Store Data'],
      ['Last Updated:', new Date().toLocaleString()],
      [''],
      ['Brands'],
      ['ID', 'Name', 'Description', 'Image URL'],
      ...brands.map(brand => [
        brand.id,
        brand.name,
        brand.description || '',
        brand.image || ''
      ]),
      [''],
      ['Products'],
      ['ID', 'Name', 'Description', 'Price', 'Stock', 'Brand ID', 'Image URL'],
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

    // Clear existing content
    console.log('Clearing existing sheet content...');
    await sheetsClient.spreadsheets.values.clear({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'store-data!A:Z'
    });

    // Write new data
    console.log('Writing new data to sheet...');
    const response = await sheetsClient.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'store-data!A1',
      valueInputOption: 'RAW',
      requestBody: { values: data }
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
    throw error;
  }
}