import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { exec } from 'child_process'
import { promisify } from 'util'
import { computeDiffs } from '@/lib/selectiveWrite'
import { getAllowedFields } from '@/lib/fieldOwnership'

const execAsync = promisify(exec)

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  let cleanupFilePath: string | null = null
  
  try {
    const { filePath, fileName } = await request.json()
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      )
    }

    cleanupFilePath = filePath

    console.log('📄 Processing PDF:', fileName)

    // Convert PDF to text using pdftotext
    console.log('📖 Converting PDF to text...')
    let pdfText: string
    try {
      const { stdout } = await execAsync(`pdftotext "${filePath}" -`)
      pdfText = stdout
    } catch (error) {
      console.error('PDF conversion failed:', error)
      throw new Error('Failed to convert PDF to text. Make sure pdftotext is installed.')
    }

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('PDF appears to be empty or could not be converted to text')
    }

    console.log('✓ PDF converted to text (', pdfText.length, 'characters)')

    // Analyze the text with OpenAI
    console.log('🤖 Analyzing PDF content with OpenAI...')
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting structured data from Technical Data Sheets (TDS) and Safety Data Sheets (SDS). 

Extract the following information and return it as a JSON object with this exact structure:

{
  "metadata": {
    "document_type": "TDS" or "SDS",
    "product_name_extracted": "extracted product name",
    "extraction_confidence": "high" | "medium" | "low",
    "document_quality": "excellent" | "good" | "fair" | "poor",
    "flags": {
      "needs_manual_review": boolean,
      "has_ambiguities": boolean,
      "missing_critical_data": boolean
    }
  },
  "product_match": {
    "existing_product_id": null,
    "match_confidence": "none",
    "action_required": "create_new_product"
  },
  "extracted_data": {
    "product": {
      "name": "product name",
      "manufacturer": "manufacturer name",
      "signal_word": "DANGER" | "WARNING" | null,
      "hazard_statements": ["H200", "H201", etc.],
      "precautionary_statements": ["P101", "P102", etc.],
      "un_number": "UN1234",
      "cas_number": "123-45-6",
      "molecular_formula": "H2O",
      "molecular_weight": "18.02",
      "physical_state": "liquid" | "solid" | "gas",
      "color": "color description",
      "odor": "odor description",
      "ph": "pH value",
      "melting_point": "temperature",
      "boiling_point": "temperature",
      "flash_point": "temperature",
      "density": "density value",
      "solubility": "solubility description",
      "stability": "stability information",
      "incompatibilities": ["substance1", "substance2"],
      "hazardous_decomposition": ["CO2", "H2O"],
      "first_aid_measures": {
        "inhalation": "first aid for inhalation",
        "skin_contact": "first aid for skin contact",
        "eye_contact": "first aid for eye contact",
        "ingestion": "first aid for ingestion"
      },
      "fire_fighting_measures": "fire fighting information",
      "accidental_release_measures": "spill cleanup information",
      "handling_storage": "handling and storage instructions",
      "exposure_controls": {
        "personal_protective_equipment": "PPE requirements",
        "engineering_controls": "ventilation requirements"
      },
      "toxicological_information": "toxicity information",
      "ecological_information": "environmental impact",
      "disposal_considerations": "disposal instructions",
      "transport_information": "shipping information",
      "regulatory_information": "regulatory status",
      "other_information": "additional notes"
    },
    "pictograms": [
      {"slug": "ghs01", "confidence": "high"},
      {"slug": "ghs02", "confidence": "medium"}
    ],
    "category": {
      "suggested_slug": "chemical-category",
      "confidence": "high"
    }
  },
  "extraction_notes": {
    "high_confidence_fields": ["name", "manufacturer"],
    "low_confidence_fields": ["molecular_formula"],
    "missing_fields": ["cas_number"],
    "ambiguities": [
      {
        "field": "signal_word",
        "issue": "conflicting information found",
        "recommendation": "manual review required"
      }
    ],
    "data_quality_issues": [
      {
        "field": "hazard_statements",
        "issue": "unclear formatting"
      }
    ]
  },
  "recommended_actions": [
    "Review extracted hazard statements",
    "Verify UN number accuracy"
  ]
}

Be thorough and accurate, especially with safety-related information. If information is not available, use null or empty arrays as appropriate.`
        },
        {
          role: "user",
          content: `Please analyze this ${fileName.includes('SDS') ? 'Safety Data Sheet' : 'Technical Data Sheet'} and extract all product information according to the schema above. Be thorough and accurate, especially with safety-related information.

PDF Content:
${pdfText}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.1
    })

    // Parse the response
    const responseText = response.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    let extractedData
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch {
      console.error('Failed to parse OpenAI response as JSON:', responseText)
      throw new Error('OpenAI did not return valid JSON')
    }

    console.log('✓ Extraction complete')
    console.log('  Product:', extractedData.metadata?.product_name_extracted)
    console.log('  Confidence:', extractedData.metadata?.extraction_confidence)

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
        source_file_path: filePath,
        raw_text: pdfText,
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
          reason: `${diff.reason} (${documentType} document)`
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

    // Clean up the uploaded file
    if (cleanupFilePath) {
      try {
        await unlink(cleanupFilePath)
        console.log('  ✓ Cleaned up temporary file')
      } catch {
        console.error('  ⚠️ Failed to cleanup file')
      }
    }

    return NextResponse.json({ 
      runId: extractionRun.id,
      updatesPerformed,
      productId: matchedProductId,
      ...extractedData
    })

  } catch (error) {
    console.error('Processing error:', error)

    // Clean up file on error
    if (cleanupFilePath) {
      try {
        await unlink(cleanupFilePath)
      } catch {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to process PDF', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
