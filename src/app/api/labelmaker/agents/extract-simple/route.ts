import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 PDF extraction endpoint called - SIMPLE VERSION')
    
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const file = files[0]
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }

    // Return a simple success response for now
    return NextResponse.json({
      success: true,
      message: 'PDF received successfully',
      fileName: file.name,
      fileSize: file.size,
      data: {
        metadata: {
          document_type: 'TDS',
          product_name_extracted: 'Test Product',
          extraction_confidence: 'high',
          document_quality: 'good',
          flags: {
            needs_manual_review: false,
            has_ambiguities: false,
            missing_critical_data: false
          }
        },
        product_match: {
          existing_product_id: null,
          match_confidence: 'high',
          action_required: 'create_new'
        },
        extracted_data: {
          product: {
            name: 'Test Product',
            description: 'Test description'
          },
          pictograms: [],
          category: { suggested_slug: 'test', confidence: 'high' }
        },
        extraction_notes: {
          high_confidence_fields: ['name', 'description'],
          low_confidence_fields: [],
          missing_fields: [],
          ambiguities: [],
          data_quality_issues: []
        },
        recommended_actions: ['Review extracted data', 'Add to database']
      }
    })

  } catch (error) {
    console.error('PDF extraction error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to extract data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

