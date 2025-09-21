import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addPictogramsColumn() {
    console.log('Adding pictograms column to products table...')
    
    try {
        // Execute the SQL to add the column
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS pictograms TEXT;'
        })
        
        if (error) {
            console.error('Error adding pictograms column:', error.message)
            // Try direct query approach
            const { data: queryData, error: queryError } = await supabase
                .from('products')
                .select('pictograms')
                .limit(1)
            
            if (queryError && queryError.message.includes('column "pictograms" does not exist')) {
                console.error('Column does not exist and cannot be added with current permissions.')
                console.log('You may need to run this SQL directly in your Supabase dashboard:')
                console.log('ALTER TABLE products ADD COLUMN pictograms TEXT;')
                return false
            } else if (!queryError) {
                console.log('✅ Column already exists or was added successfully')
                return true
            }
        } else {
            console.log('✅ Successfully added pictograms column')
            return true
        }
    } catch (error) {
        console.error('Error:', error.message)
        return false
    }
}

// Run the migration
addPictogramsColumn()
    .then((success) => {
        if (success) {
            console.log('Migration completed successfully!')
            console.log('You can now run the pictograms upload script.')
        } else {
            console.log('Migration failed. Please add the column manually in Supabase dashboard.')
        }
        process.exit(success ? 0 : 1)
    })
    .catch((error) => {
        console.error('Failed to run migration:', error)
        process.exit(1)
    })
