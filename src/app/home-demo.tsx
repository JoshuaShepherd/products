import React from 'react'
import { Database, Package, FileText, Settings } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Products Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive database-driven product and label management system for concrete chemical companies.
            Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<Database className="w-8 h-8" />}
            title="Comprehensive Database"
            description="Normalized PostgreSQL schema with categories, products, hazard information, and multi-language support"
          />
          <FeatureCard
            icon={<Package className="w-8 h-8" />}
            title="Product Management"
            description="Manage hundreds of chemical products with technical specs, safety data, and regulatory information"
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="Label Generation"
            description="Generate professional product labels in multiple sizes with HTML/CSS templates for PDF conversion"
          />
          <FeatureCard
            icon={<Settings className="w-8 h-8" />}
            title="Multi-Language"
            description="English, French, and Spanish language support for international compliance and distribution"
          />
        </div>

        {/* Database Schema Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Database Architecture</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SchemaTable 
              name="products" 
              description="Core product information with safety data, multilingual descriptions, and technical specifications"
              fields={["name", "description", "hazard_statements", "voc_data", "shelf_life"]}
            />
            <SchemaTable 
              name="categories" 
              description="Hierarchical product categorization system"
              fields={["name", "slug", "parent_id", "sort_order"]}
            />
            <SchemaTable 
              name="pictograms" 
              description="Hazard symbols and safety pictograms library"
              fields={["name", "url", "description"]}
            />
            <SchemaTable 
              name="label_templates" 
              description="HTML/CSS templates for different label sizes"
              fields={["name", "html_template", "css_template", "dimensions"]}
            />
            <SchemaTable 
              name="product_variants" 
              description="Size and packaging variations for each product"
              fields={["name", "size", "weight_kg", "price"]}
            />
            <SchemaTable 
              name="application_methods" 
              description="Usage instructions and application procedures"
              fields={["method_name", "instructions", "coverage_rate"]}
            />
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-blue-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
          <div className="space-y-4">
            <QuickStartStep
              step={1}
              title="Set up Supabase Database"
              description="Run the schema.sql file to create all tables, types, and relationships"
              code="psql -f database/schema.sql"
            />
            <QuickStartStep
              step={2}
              title="Import Product Data"
              description="Use the migration script to import your CSV data into the structured schema"
              code="psql -f database/migrate.sql"
            />
            <QuickStartStep
              step={3}
              title="Configure Environment"
              description="Update your .env.local file with your Supabase credentials"
              code="NEXT_PUBLIC_SUPABASE_URL=your_url"
            />
            <QuickStartStep
              step={4}
              title="Start Development"
              description="Launch the development server and begin building your application"
              code="npm run dev"
            />
          </div>
        </div>

        {/* Technology Stack */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Built With Modern Technologies</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Next.js 15', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 
              'Supabase', 'PostgreSQL', 'React', 'Node.js'
            ].map((tech) => (
              <span 
                key={tech}
                className="bg-white px-4 py-2 rounded-full shadow-sm text-gray-700 font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

interface SchemaTableProps {
  name: string
  description: string
  fields: string[]
}

function SchemaTable({ name, description, fields }: SchemaTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <h3 className="font-semibold text-gray-900 mb-2 font-mono">{name}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="space-y-1">
        {fields.map((field) => (
          <div key={field} className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
            {field}
          </div>
        ))}
      </div>
    </div>
  )
}

interface QuickStartStepProps {
  step: number
  title: string
  description: string
  code: string
}

function QuickStartStep({ step, title, description, code }: QuickStartStepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
        {step}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">{description}</p>
        <code className="bg-gray-800 text-green-400 px-3 py-1 rounded text-sm font-mono">
          {code}
        </code>
      </div>
    </div>
  )
}
