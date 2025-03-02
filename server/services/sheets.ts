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

export async function createOrUpdateSheets(spreadsheetId: string, brands: Brand[]) {
  console.log('Creating/updating sheets for brands:', brands.map(b => b.name).join(', '));

  // Update brands overview sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Brands Overview!A1:D1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['ID', 'Name', 'Description', 'Image URL']]
    }
  });

  // Create or update individual brand sheets
  for (const brand of brands) {
    console.log(`Processing sheet for brand: ${brand.name}`);
    const sheetName = `${brand.name} Products`;

    // Check if sheet exists
    try {
      await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!A1:A1`
      });
      console.log(`Sheet "${sheetName}" already exists`);
    } catch (error) {
      console.log(`Creating new sheet "${sheetName}"`);
      // Sheet doesn't exist, create it
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName
              }
            }
          }]
        }
      });
    }

    // Set headers for the brand's product sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!A1:F1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['ID', 'Name', 'Description', 'Price', 'Stock', 'Image URL']]
      }
    });
  }
}

export async function syncBrandsOverview(brands: Brand[], spreadsheetId: string) {
  console.log('Syncing brands overview...');
  const values = brands.map(brand => [
    brand.id,
    brand.name,
    brand.description,
    brand.image
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Brands Overview!A2',
    valueInputOption: 'RAW',
    requestBody: { values }
  });
  console.log(`Synced ${values.length} brands to overview sheet`);
}

export async function syncBrandProducts(brand: Brand, products: Product[], spreadsheetId: string) {
  console.log(`Syncing products for brand: ${brand.name}`);
  const brandProducts = products.filter(product => product.brandId === brand.id);
  const values = brandProducts.map(product => [
    product.id,
    product.name,
    product.description,
    product.price,
    product.stock,
    product.image
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${brand.name} Products'!A2`,
    valueInputOption: 'RAW',
    requestBody: { values }
  });
  console.log(`Synced ${values.length} products for brand ${brand.name}`);
}

export async function syncStoreData(spreadsheetId: string, brands: Brand[], products: Product[]) {
  try {
    console.log('Starting store data sync...');
    console.log('Using spreadsheet ID:', spreadsheetId);
    console.log('Found brands:', brands.length);
    console.log('Found products:', products.length);

    // Create or update all necessary sheets
    await createOrUpdateSheets(spreadsheetId, brands);

    // Sync brands overview
    await syncBrandsOverview(brands, spreadsheetId);

    // Sync each brand's products
    for (const brand of brands) {
      await syncBrandProducts(brand, products, spreadsheetId);
    }

    console.log('Store data sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error);
    return false;
  }
}