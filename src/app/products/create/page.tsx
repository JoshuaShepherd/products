'use client'

import { ProductForm } from '@/components/ProductForm'

export default function CreateProductPage() {
  return (
    <div className="container mx-auto py-8">
      <ProductForm mode="create" />
    </div>
  )
}
