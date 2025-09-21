import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import csv from 'csv-parser'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Found' : 'Missing')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updatePictogramsFromCSV() {
    const results = []
    let processedProducts = 0
    let updatedProducts = 0
    let skippedProducts = 0
    
    console.log('Starting pictograms upload from CSV...')
    
    return new Promise((resolve, reject) => {
        fs.createReadStream('/Users/joshshepherd/Desktop/GitHub/products/public/data/products_rows.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                console.log(`Found ${results.length} products in CSV`)
                
                for (const row of results) {
                    processedProducts++
                    
                    try {
                        const productName = row.product?.trim()
                        const pictogramsData = row.pictograms?.trim()
                        
                        if (!productName) {
                            console.log(`Skipping row ${processedProducts}: No product name`)
                            skippedProducts++
                            continue
                        }
                        
                        // Convert product name to slug format (lowercase, spaces to hyphens)
                        const slug = productName.toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
                            .replace(/\s+/g, '-') // Replace spaces with hyphens
                            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                            .trim()
                        
                        console.log(`Processing: ${productName} (slug: ${slug})`)
                        
                        // Prepare update data
                        const updateData = {}
                        
                        // Handle pictograms - store as text (comma-separated URLs)
                        if (pictogramsData && pictogramsData !== '') {
                            updateData.pictograms = pictogramsData
                            console.log(`  - Pictograms: ${pictogramsData.substring(0, 100)}${pictogramsData.length > 100 ? '...' : ''}`)
                        }
                        
                        // Only update if we have data
                        if (Object.keys(updateData).length > 0) {
                            const { data, error } = await supabase
                                .from('products')
                                .update(updateData)
                                .eq('slug', slug)
                                .select('id, name')
                            
                            if (error) {
                                console.error(`Error updating ${productName}:`, error.message)
                                continue
                            }
                            
                            if (data && data.length > 0) {
                                updatedProducts++
                                console.log(`✅ Updated: ${data[0].name}`)
                            } else {
                                console.log(`⚠️  No product found with slug: ${slug} (${productName})`)
                                skippedProducts++
                            }
                        } else {
                            console.log(`  - No pictograms data to update`)
                            skippedProducts++
                        }
                        
                    } catch (error) {
                        console.error(`Error processing row ${processedProducts}:`, error.message)
                        continue
                    }
                }
                
                console.log('\n=== PICTOGRAMS UPLOAD SUMMARY ===')
                console.log(`Total products processed: ${processedProducts}`)
                console.log(`Successfully updated: ${updatedProducts}`)
                console.log(`Skipped: ${skippedProducts}`)
                console.log('=================================')
                
                resolve()
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error)
                reject(error)
            })
    })
}

// Run the update
updatePictogramsFromCSV()
    .then(() => {
        console.log('Pictograms upload completed successfully!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('Failed to upload pictograms:', error)
        process.exit(1)
    })
