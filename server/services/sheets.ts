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

async function clearAndWriteRange(spreadsheetId: string, range: string, values: any[][]) {
  try {
    // Clear the range first
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    console.log(`Cleared range: ${range}`);

    // Write new values
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
    console.log(`Updated range: ${range} with ${values.length} rows`);
  } catch (error) {
    console.error(`Error updating range ${range}:`, error);
    throw error;
  }
}

async function writeBrandsData(spreadsheetId: string, brands: Brand[]) {
  console.log('Writing brands data...');
  const headers = [['ID', 'Name', 'Description', 'Image URL']];
  const values = brands.map(brand => [
    brand.id,
    brand.name,
    brand.description,
    brand.image
  ]);

  try {
    await clearAndWriteRange(spreadsheetId, 'store-data!A1:D100', [...headers, ...values]);
    console.log(`Successfully wrote ${brands.length} brands`);
  } catch (error) {
    console.error('Error writing brands data:', error);
    throw error;
  }
}

async function writeProductsData(spreadsheetId: string, products: Product[]) {
  console.log('Writing products data...');
  const headers = [['ID', 'Name', 'Description', 'Price', 'Stock', 'Brand ID', 'Image URL']];
  const values = products.map(product => [
    product.id,
    product.name,
    product.description,
    product.price,
    product.stock,
    product.brandId,
    product.image
  ]);

  try {
    await clearAndWriteRange(spreadsheetId, 'store-data!F1:L100', [...headers, ...values]);
    console.log(`Successfully wrote ${products.length} products`);
  } catch (error) {
    console.error('Error writing products data:', error);
    throw error;
  }
}

export async function syncStoreData(brands: Brand[], products: Product[]) {
  const spreadsheetId = process.env.SPREADSHEET_ID || '1B4725ciwmsgyatjgcjvpaKynUaDuDnAXGF0vwPwdLwg'; // Use environment variable if available, otherwise fallback

  try {
    console.log('Starting store data sync...');
    console.log('Using spreadsheet ID:', spreadsheetId);
    console.log('Found brands:', brands.length);
    console.log('Found products:', products.length);

    // Write brands data
    await writeBrandsData(spreadsheetId, brands);

    // Write products data
    await writeProductsData(spreadsheetId, products);

    console.log('Store data sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error);
    return false;
  }
}