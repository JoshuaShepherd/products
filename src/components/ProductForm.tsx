'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProductFormSchema, ProductFormData } from '@/lib/schemas/product.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Save, AlertCircle, CheckCircle } from 'lucide-react'

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  mode?: 'create' | 'edit'
  onSuccess?: (product: any) => void
}

export function ProductForm({ initialData, mode = 'create', onSuccess }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      sku: initialData?.sku || '',
      category_id: initialData?.category_id || '',
      short_description_english: initialData?.short_description_english || '',
      short_description_french: initialData?.short_description_french || '',
      short_description_spanish: initialData?.short_description_spanish || '',
      description: initialData?.description || '',
      application: initialData?.application || '',
      features: initialData?.features || '',
      coverage: initialData?.coverage || '',
      shelf_life: initialData?.shelf_life || '',
      limitations: initialData?.limitations || '',
      voc_data: initialData?.voc_data || '',
      signal_word: initialData?.signal_word || 'None',
      components_determining_hazard: initialData?.components_determining_hazard || '',
      hazard_statements: initialData?.hazard_statements || '',
      precautionary_statements: initialData?.precautionary_statements || '',
      response_statements: initialData?.response_statements || '',
      first_aid: initialData?.first_aid || '',
      storage: initialData?.storage || '',
      disposal: initialData?.disposal || '',
      green_conscious: initialData?.green_conscious || false,
      do_not_freeze: initialData?.do_not_freeze || false,
      mix_well: initialData?.mix_well || false,
      used_by_date: initialData?.used_by_date || '',
      subtitle_1: initialData?.subtitle_1 || '',
      subtitle_2: initialData?.subtitle_2 || '',
      hazard_class: initialData?.hazard_class || 'Not applicable',
      packing_group: initialData?.packing_group || 'Not applicable',
    },
    mode: 'onChange'
  })

  // Auto-generate slug from name
  const nameValue = watch('name')
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('name', name)
    
    if (name && mode === 'create') {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      setValue('slug', slug)
    }
  }

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    console.log('🚀 Form submitted with data:', data)
    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Map back to legacy form format for API compatibility
          'Title': data.name,
          'SKU': data.sku,
          'Category': data.category_id,
          'Short Description (EN)': data.short_description_english,
          'Short Description (FR)': data.short_description_french,
          'Short Description (SP)': data.short_description_spanish,
          'Description': data.description,
          'Application': data.application,
          'Features': data.features,
          'Coverage': data.coverage,
          'Shelf Life': data.shelf_life,
          'Limitations': data.limitations,
          'VOC Data': data.voc_data,
          'Signal Word': data.signal_word,
          'Components Determining Hazard': data.components_determining_hazard,
          'Hazard Statements': data.hazard_statements,
          'Precautionary Statements': data.precautionary_statements,
          'Response Statements': data.response_statements,
          'First Aid': data.first_aid,
          'Storage': data.storage,
          'Disposal': data.disposal,
          'Green Conscious': data.green_conscious,
          'Do Not Freeze': data.do_not_freeze,
          'Mix Well': data.mix_well,
          'Used By Date': data.used_by_date,
          'Subtitle 1': data.subtitle_1,
          'Subtitle 2': data.subtitle_2,
          'Hazard Class': data.hazard_class,
          'Packing Group': data.packing_group,
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setSubmitError(result.error || 'Failed to create product')
        return
      }

      setSubmitSuccess(result.message || 'Product created successfully!')
      
      if (onSuccess) {
        onSuccess(result.product)
      }

      // Reset form after successful creation
      if (mode === 'create') {
        reset()
      }

    } catch (error) {
      console.error('❌ Form submission error:', error)
      setSubmitError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {mode === 'edit' ? 'Edit Product' : 'Create New Product'}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {submitSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{submitSuccess}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      onChange={handleNameChange}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      {...register('slug')}
                      className={errors.slug ? 'border-red-500' : ''}
                    />
                    {errors.slug && (
                      <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      {...register('sku')}
                      className={errors.sku ? 'border-red-500' : ''}
                    />
                    {errors.sku && (
                      <p className="text-sm text-red-500 mt-1">{errors.sku.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category_id">Category</Label>
                    <Input
                      id="category_id"
                      {...register('category_id')}
                      placeholder="UUID of category"
                      className={errors.category_id ? 'border-red-500' : ''}
                    />
                    {errors.category_id && (
                      <p className="text-sm text-red-500 mt-1">{errors.category_id.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="descriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Descriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="short_description_english">Short Description (English)</Label>
                    <Textarea
                      id="short_description_english"
                      {...register('short_description_english')}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="short_description_french">Short Description (French)</Label>
                    <Textarea
                      id="short_description_french"
                      {...register('short_description_french')}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="short_description_spanish">Short Description (Spanish)</Label>
                    <Textarea
                      id="short_description_spanish"
                      {...register('short_description_spanish')}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="application">Application</Label>
                    <Textarea
                      id="application"
                      {...register('application')}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="features">Features</Label>
                    <Textarea
                      id="features"
                      {...register('features')}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Safety Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signal_word">Signal Word</Label>
                    <Select value={watch('signal_word') || 'None'} onValueChange={(value) => setValue('signal_word', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Warning">Warning</SelectItem>
                        <SelectItem value="Danger">Danger</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="hazard_class">Hazard Class</Label>
                    <Select value={watch('hazard_class') || 'Not applicable'} onValueChange={(value) => setValue('hazard_class', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not applicable">Not applicable</SelectItem>
                        <SelectItem value="Class 1">Class 1</SelectItem>
                        <SelectItem value="Class 2">Class 2</SelectItem>
                        <SelectItem value="Class 3">Class 3</SelectItem>
                        <SelectItem value="Class 4">Class 4</SelectItem>
                        <SelectItem value="Class 5">Class 5</SelectItem>
                        <SelectItem value="Class 6">Class 6</SelectItem>
                        <SelectItem value="Class 7">Class 7</SelectItem>
                        <SelectItem value="Class 8">Class 8</SelectItem>
                        <SelectItem value="Class 9">Class 9</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="hazard_statements">Hazard Statements</Label>
                    <Textarea
                      id="hazard_statements"
                      {...register('hazard_statements')}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="precautionary_statements">Precautionary Statements</Label>
                    <Textarea
                      id="precautionary_statements"
                      {...register('precautionary_statements')}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="first_aid">First Aid</Label>
                    <Textarea
                      id="first_aid"
                      {...register('first_aid')}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attributes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="green_conscious"
                      checked={!!watch('green_conscious')}
                      onCheckedChange={(checked) => setValue('green_conscious', !!checked)}
                    />
                    <Label htmlFor="green_conscious">Green Conscious</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="do_not_freeze"
                      checked={!!watch('do_not_freeze')}
                      onCheckedChange={(checked) => setValue('do_not_freeze', !!checked)}
                    />
                    <Label htmlFor="do_not_freeze">Do Not Freeze</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mix_well"
                      checked={!!watch('mix_well')}
                      onCheckedChange={(checked) => setValue('mix_well', !!checked)}
                    />
                    <Label htmlFor="mix_well">Mix Well</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subtitle_1">Subtitle 1</Label>
                    <Input
                      id="subtitle_1"
                      {...register('subtitle_1')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subtitle_2">Subtitle 2</Label>
                    <Input
                      id="subtitle_2"
                      {...register('subtitle_2')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="used_by_date">Used By Date</Label>
                  <Input
                    id="used_by_date"
                    {...register('used_by_date')}
                    placeholder="e.g., 2 years from date of purchase"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p><strong>Form Valid:</strong> {isValid ? 'Yes' : 'No'}</p>
              <p><strong>Errors:</strong> {Object.keys(errors).length}</p>
              {Object.keys(errors).length > 0 && (
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(errors, null, 2)}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
