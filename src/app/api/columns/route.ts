import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Query the actual database schema to get column information
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error fetching schema:', error)
      return NextResponse.json(
        { error: 'Failed to fetch database schema' },
        { status: 500 }
      )
    }

    // Extract column names from the actual data structure
    const columns = data && data.length > 0 ? Object.keys(data[0]) : []
    
    // Format column names to be more user-friendly
    const formattedColumns = columns.map(col => {
      // Convert snake_case to Title Case
      return col
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    })

    return NextResponse.json({ 
      columns: formattedColumns,
      raw_columns: columns,
      count: columns.length 
    })
  } catch (error) {
    console.error('Error in columns API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
