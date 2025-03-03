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

export async function syncStoreData(brands: Brand[], products: Product[]) {
  const spreadsheetId = process.env.SPREADSHEET_ID || '1B4725ciwmsgyatjgcjvpaKynUaDuDnAXGF0vwPwdLwg';
  const sheetName = 'store-data';

  try {
    console.log('Starting store data sync...');
    console.log(`Using spreadsheet ID: ${spreadsheetId}`);
    console.log(`Using sheet name: ${sheetName}`);

    // Write brands data
    const brandsData = [
      ['ID', 'Name', 'Description', 'Image URL'], // Headers
      ...brands.map(brand => [
        brand.id,
        brand.name,
        brand.description,
        brand.image
      ])
    ];

    console.log('Writing brands data:', brandsData);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:D${brands.length + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: brandsData
      }
    });
    console.log('Successfully wrote brands data');

    // Write products data
    const productsData = [
      ['ID', 'Name', 'Description', 'Price', 'Stock', 'Brand ID', 'Image URL'], // Headers
      ...products.map(product => [
        product.id,
        product.name,
        product.description,
        product.price,
        product.stock,
        product.brandId,
        product.image
      ])
    ];

    console.log('Writing products data:', productsData);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!F1:L${products.length + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: productsData
      }
    });
    console.log('Successfully wrote products data');

    console.log('Store data sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return false;
  }
}