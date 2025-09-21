#!/bin/bash

# Supabase Database Import Script
# 
# Before running this script, you need to get your database connection details from:
# Supabase Dashboard → Settings → Database → Connection parameters
#
# Option 1: Direct Connection (recommended for imports)
# Replace [YOUR_PASSWORD] with your actual database password
echo "🔐 Using direct database connection..."
echo "📝 Make sure you have your database password from Supabase Dashboard"
echo ""

# Your Supabase project reference from the URL
PROJECT_REF="bnwbjrlgoylmbblfmsru"

# Option 1: Direct connection (you'll be prompted for password)
echo "🚀 Running SAFE database import (existing data will NOT be overwritten)..."
echo "   Project: $PROJECT_REF"
echo "   File: import-merged-products-2025-09-08.sql"
echo ""

# Direct connection - will prompt for password
psql "postgresql://postgres@db.$PROJECT_REF.supabase.co:5432/postgres" \
  -f import-merged-products-2025-09-08.sql

# Alternative: If you want to set the password as an environment variable
# export PGPASSWORD="your_password_here"
# psql "postgresql://postgres@db.$PROJECT_REF.supabase.co:5432/postgres" \
#   -f import-merged-products-2025-09-08.sql

echo ""
echo "✅ Import completed!"
echo "📊 Check the output above for any errors or confirmation messages"
