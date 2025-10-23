import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeDiffs } from '@/lib/selectiveWrite'
import { getAllowedFields } from '@/lib/fieldOwnership'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const extractedData = await request.json()
    
    if (!extractedData) {
      return NextResponse.json(
        { error: 'No extraction data provided' },
        { status: 400 }
      )
    }

    console.log('💾 Starting Agent 2: Database Injection...')
    console.log('  Product:', extractedData.metadata?.product_name_extracted)
    console.log('  Document Type:', extractedData.metadata?.document_type)

    // Try to match with existing product in database
    let matchedProductId: string | null = null
    if (extractedData.extracted_data?.product?.name) {
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id, name')
        .ilike('name', `%${extractedData.extracted_data.product.name}%`)
        .limit(1)

      if (existingProducts && existingProducts.length > 0) {
        matchedProductId = existingProducts[0].id
        extractedData.product_match.existing_product_id = existingProducts[0].id
        extractedData.product_match.match_confidence = 'high'
        extractedData.product_match.match_method = 'name_fuzzy'
        console.log('  ✓ Found matching product:', existingProducts[0].name)
      }
    }

    // PERSIST EXTRACTION FIRST - Always save the full extraction
    const { data: extractionRun, error: extractionError } = await supabase
      .from('extraction_runs')
      .insert({
        product_candidate: extractedData.metadata?.product_name_extracted,
        product_id: matchedProductId,
        document_type: extractedData.metadata?.document_type || 'UNKNOWN',
        source_file_path: 'Agent Builder Upload',
        raw_text: null, // Agent Builder doesn't provide raw text
        extracted_json: extractedData,
        confidence: extractedData.metadata?.extraction_confidence || 'low',
        needs_manual_review: extractedData.metadata?.flags?.needs_manual_review || false,
        status: 'processed'
      })
      .select()
      .single()

    if (extractionError) {
      console.error('Failed to persist extraction:', extractionError)
      throw new Error('Failed to persist extraction data')
    }

    console.log('✓ Extraction persisted with run ID:', extractionRun.id)

    // COMPUTE DIFFS AND PERFORM SELECTIVE WRITES
    let updatesPerformed = 0
    const documentType = extractedData.metadata?.document_type || 'UNKNOWN'
    const fieldsAllowed = getAllowedFields(documentType)

    console.log(`✓ Using ${documentType} field allowlist:`, fieldsAllowed.slice(0, 5), fieldsAllowed.length > 5 ? `... (+${fieldsAllowed.length - 5} more)` : '')

    if (matchedProductId) {
      // Get current product data
      const { data: currentProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', matchedProductId)
        .single()

      if (currentProduct) {
        // Compute diffs
        const diffs = computeDiffs(currentProduct, extractedData.extracted_data.product, fieldsAllowed)
        
        // Log all diffs to audit_log
        const auditEntries = diffs.map(diff => ({
          run_id: extractionRun.id,
          product_id: matchedProductId,
          field: diff.field,
          old_value: diff.old,
          new_value: diff.new,
          action: diff.action,
          reason: `${diff.reason} (${documentType} document via Agent Builder)`
        }))

        if (auditEntries.length > 0) {
          const { error: auditError } = await supabase
            .from('audit_log')
            .insert(auditEntries)

          if (auditError) {
            console.error('Failed to log audit entries:', auditError)
          }
        }

        // Perform selective writes
        const fieldsToUpdate: Record<string, unknown> = {}
        for (const diff of diffs) {
          if (diff.action === 'write') {
            fieldsToUpdate[diff.field] = diff.new
            updatesPerformed++
          }
        }

        if (Object.keys(fieldsToUpdate).length > 0) {
          const { error: updateError } = await supabase
            .from('products')
            .update(fieldsToUpdate)
            .eq('id', matchedProductId)

          if (updateError) {
            console.error('Failed to update product:', updateError)
            // Update extraction run status to failed
            await supabase
              .from('extraction_runs')
              .update({ 
                status: 'failed',
                error: `Update failed: ${updateError.message}`
              })
              .eq('id', extractionRun.id)
          } else {
            // Update extraction run status to updated
            await supabase
              .from('extraction_runs')
              .update({ status: 'updated' })
              .eq('id', extractionRun.id)
            
            console.log(`✓ Updated ${updatesPerformed} fields for product ${matchedProductId}`)
          }
        } else {
          // Update extraction run status to skipped
          await supabase
            .from('extraction_runs')
            .update({ status: 'skipped' })
            .eq('id', extractionRun.id)
          
          console.log('✓ No fields updated (all fields already populated)')
        }
      }
    } else {
      // Update extraction run status to matched (no product found)
      await supabase
        .from('extraction_runs')
        .update({ status: 'matched' })
        .eq('id', extractionRun.id)
    }

    return NextResponse.json({
      success: true,
      data: {
        runId: extractionRun.id,
        updatesPerformed,
        productId: matchedProductId,
        extractionData: extractedData
      },
      message: `Database injection completed. ${updatesPerformed} fields updated.`
    })

  } catch (error) {
    console.error('Database injection error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to inject data into database', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
