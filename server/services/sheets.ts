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

async function ensureSheetExists(spreadsheetId: string, sheetTitle: string) {
  try {
    // Try to get the spreadsheet first
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // Check if our sheet exists
    const sheetExists = spreadsheet.data.sheets?.some(
      sheet => sheet.properties?.title === sheetTitle
    );

    if (!sheetExists) {
      console.log(`Creating sheet "${sheetTitle}"...`);
      // Add the sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetTitle,
              },
            },
          }],
        },
      });
      console.log(`Created sheet "${sheetTitle}"`);
    }
  } catch (error) {
    console.error('Error ensuring sheet exists:', error);
    throw error;
  }
}

async function writeToSheet(spreadsheetId: string, range: string, values: any[][]) {
  try {
    // Clear the existing content
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    console.log(`Cleared range: ${range}`);

    // Write the new values
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
    console.log(`Updated range: ${range} with ${values.length} rows`);
  } catch (error) {
    console.error('Error writing to sheet:', error);
    throw error;
  }
}

export async function syncStoreData(brands: Brand[], products: Product[]) {
  const spreadsheetId = process.env.SPREADSHEET_ID || '1B4725ciwmsgyatjgcjvpaKynUaDuDnAXGF0vwPwdLwg';
  const sheetName = 'store-data';

  try {
    console.log('Starting store data sync...');
    console.log(`Using spreadsheet ID: ${spreadsheetId}`);
    console.log(`Using sheet name: ${sheetName}`);

    // Ensure the sheet exists
    await ensureSheetExists(spreadsheetId, sheetName);

    // Write brands data (columns A-D)
    const brandsHeaders = [['ID', 'Name', 'Description', 'Image URL']];
    const brandsData = brands.map(brand => [
      brand.id,
      brand.name,
      brand.description,
      brand.image
    ]);
    await writeToSheet(
      spreadsheetId,
      `${sheetName}!A1:D${brandsData.length + 1}`,
      [...brandsHeaders, ...brandsData]
    );

    // Write products data (columns F-L)
    const productsHeaders = [['ID', 'Name', 'Description', 'Price', 'Stock', 'Brand ID', 'Image URL']];
    const productsData = products.map(product => [
      product.id,
      product.name,
      product.description,
      product.price,
      product.stock,
      product.brandId,
      product.image
    ]);
    await writeToSheet(
      spreadsheetId,
      `${sheetName}!F1:L${productsData.length + 1}`,
      [...productsHeaders, ...productsData]
    );

    console.log('Store data sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error);
    return false;
  }
}