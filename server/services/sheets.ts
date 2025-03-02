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

async function createSheetIfNotExists(spreadsheetId: string, sheetTitle: string) {
  try {
    // Try to get the sheet first
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetTitle}!A1`
    });
    console.log(`Sheet "${sheetTitle}" already exists`);
  } catch (error) {
    console.log(`Creating new sheet "${sheetTitle}"`);
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetTitle
              }
            }
          }]
        }
      });
      console.log(`Successfully created sheet "${sheetTitle}"`);
    } catch (error) {
      console.error(`Error creating sheet "${sheetTitle}":`, error);
      throw error;
    }
  }
}

export async function createOrUpdateSheets(spreadsheetId: string, brands: Brand[]) {
  console.log('Creating/updating sheets for brands:', brands.map(b => b.name).join(', '));

  // Create Brands_Overview sheet
  await createSheetIfNotExists(spreadsheetId, 'Brands_Overview');

  // Set headers for Brands_Overview
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Brands_Overview!A1:D1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['ID', 'Name', 'Description', 'Image URL']]
      }
    });
    console.log('Updated headers for Brands_Overview sheet');
  } catch (error) {
    console.error('Error updating Brands_Overview headers:', error);
    throw error;
  }

  // Create sheets for each brand
  for (const brand of brands) {
    const sheetName = `${brand.name}_Products`.replace(/[^a-zA-Z0-9_]/g, '_');
    console.log(`Processing sheet for brand: ${brand.name} (sheet name: ${sheetName})`);

    await createSheetIfNotExists(spreadsheetId, sheetName);

    try {
      // Set headers for the brand's product sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:F1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Name', 'Description', 'Price', 'Stock', 'Image URL']]
        }
      });
      console.log(`Updated headers for ${sheetName} sheet`);
    } catch (error) {
      console.error(`Error updating ${sheetName} headers:`, error);
      throw error;
    }
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

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Brands_Overview!A2',
      valueInputOption: 'RAW',
      requestBody: { values }
    });
    console.log(`Synced ${values.length} brands to overview sheet`);
  } catch (error) {
    console.error('Error syncing brands overview:', error);
    throw error;
  }
}

export async function syncBrandProducts(brand: Brand, products: Product[], spreadsheetId: string) {
  console.log(`Syncing products for brand: ${brand.name}`);
  const sheetName = `${brand.name}_Products`.replace(/[^a-zA-Z0-9_]/g, '_');
  const brandProducts = products.filter(product => product.brandId === brand.id);
  const values = brandProducts.map(product => [
    product.id,
    product.name,
    product.description,
    product.price,
    product.stock,
    product.image
  ]);

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A2`,
      valueInputOption: 'RAW',
      requestBody: { values }
    });
    console.log(`Synced ${values.length} products for brand ${brand.name}`);
  } catch (error) {
    console.error(`Error syncing products for ${brand.name}:`, error);
    throw error;
  }
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