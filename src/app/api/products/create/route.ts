import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ProductFormSchema, ProductInsert } from '@/lib/schemas/product.schema'
import { mapFormDataToDatabase, generateSlug } from '@/lib/schemas/form-mappings'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Product creation API called');
    
    const rawFormData = await request.json();
    console.log('📝 Raw form data received:', { title: rawFormData.Title });

    // Map legacy form data to database format
    const mappedData = mapFormDataToDatabase(rawFormData);
    console.log('🔄 Mapped to database format:', { name: mappedData.name });

    // Generate slug if not provided
    if (mappedData.name && !mappedData.slug) {
      mappedData.slug = generateSlug(mappedData.name);
      console.log('🔗 Generated slug:', mappedData.slug);
    }

    // Validate with Zod schema
    const validationResult = ProductFormSchema.safeParse(mappedData);
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.issues);
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    console.log('✅ Validation passed for product:', validatedData.name);

    // Initialize Supabase client
    const supabase = await createClient()

    // Check for duplicate slug
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('id, name, slug')
      .eq('slug', validatedData.slug)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error checking for duplicates:', checkError);
      return NextResponse.json(
        { error: 'Database error during duplicate check' },
        { status: 500 }
      );
    }

    if (existingProduct) {
      console.warn('⚠️ Duplicate slug found:', validatedData.slug);
      return NextResponse.json(
        { 
          error: 'Product with this URL slug already exists',
          existingProduct: existingProduct.name 
        },
        { status: 409 }
      );
    }

    // Insert into database
    const { data: createdProduct, error: insertError } = await supabase
      .from('products')
      .insert([validatedData as ProductInsert])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Database insert error:', insertError);
      
      // Handle specific database errors
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Product with this name or SKU already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create product', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ Product created successfully:', {
      id: createdProduct.id,
      name: createdProduct.name,
      slug: createdProduct.slug
    });

    return NextResponse.json({
      success: true,
      product: createdProduct,
      message: `Product "${createdProduct.name}" created successfully`
    });

  } catch (error) {
    console.error('💥 Unexpected error in product creation:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
