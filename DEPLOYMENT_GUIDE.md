# Deployment Guide - SpecChem Products

## Quick Deployment Checklist

### ✅ Pre-Deployment Status
- **Build Status**: ✅ Clean (no errors)
- **ESLint Status**: ✅ No errors (243 warnings - non-blocking)
- **TypeScript**: ✅ No type errors
- **Environment**: ✅ Variables documented in `.env.example`

---

## GitHub Deployment (Josh-SpecChem Account)

### 1. Repository Setup
```bash
# Ensure you're in the correct GitHub account (Josh-SpecChem)
git remote -v
# Should show: Josh-SpecChem/products

# Push to GitHub
git push origin main
```

### 2. GitHub Actions (Optional)
If using GitHub Actions for CI/CD, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Install Puppeteer Chrome
      run: npm run setup-puppeteer
    
    - name: Run build
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
```

---

## Vercel Deployment

### 1. Vercel Project Setup
1. Go to [vercel.com](https://vercel.com)
2. **Important**: Use Josh-SpecChem GitHub account
3. Import project: `Josh-SpecChem/products`

### 2. Build Settings
```
Build Command: npm run build
Install Command: npm install && npm run setup-puppeteer
Output Directory: .next
Node.js Version: 18.x
```

### 3. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Required - Get from Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional - Only if using service role features  
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Required for PDF generation
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Optional - Performance settings
PUPPETEER_SKIP_DOWNLOAD=true
```

### 4. Vercel Configuration
Create `vercel.json` (optional):

```json
{
  "build": {
    "env": {
      "PUPPETEER_SKIP_DOWNLOAD": "true"
    }
  },
  "functions": {
    "src/app/api/**": {
      "maxDuration": 30
    }
  }
}
```

---

## Post-Deployment Verification

### 1. Test Core Features
- [ ] Homepage loads correctly
- [ ] Product search works
- [ ] PDF generation works (`/api/label/[title]/pdf`)
- [ ] Database connectivity
- [ ] Image loading (optimized)

### 2. Performance Check
```bash
# Test build locally first
npm run build && npm start

# Visit http://localhost:3000
# Check for:
# - Fast loading times
# - Optimized images
# - No console errors
```

### 3. Supabase Connection Test
```bash
# Test database connection
node test-db.mjs
```

---

## Troubleshooting

### Common Issues

#### 1. Puppeteer PDF Generation Fails
**Symptoms**: PDF generation returns 500 errors
**Solution**: 
```env
# In Vercel environment variables:
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

#### 2. Build Fails on Vercel
**Symptoms**: `npm run build` fails in Vercel
**Solution**: Check that all environment variables are set correctly

#### 3. Images Not Loading
**Symptoms**: SpecChem logos/images don't appear  
**Solution**: Verify images exist in `/public/` directory

#### 4. Database Connection Issues
**Symptoms**: No product data loads
**Solution**: 
- Verify Supabase URL and keys
- Check Supabase project is active
- Verify RLS policies if applicable

---

## Performance Notes

### Optimizations Applied ✅
- Next.js Image component for local images
- Lazy loading for external images
- Clean build (no errors)
- ESM module format
- Optimized bundle size

### Bundle Analysis
- Homepage: 59.2 kB (247 kB First Load)
- Label Editor: 23 kB (213 kB First Load)
- Product Creator: 71.2 kB (296 kB First Load)

---

## Security Considerations

### Environment Variables
- ✅ `.env.local` is gitignored
- ✅ `.env.example` provided for reference
- ✅ No secrets in code
- ✅ Supabase keys properly configured

### API Routes
- All API routes use proper error handling
- Database queries use parameterized statements
- No sensitive data exposure

---

## Deployment Commands Summary

```bash
# Final pre-deployment check
npm run build
npm run lint  # Should show 0 errors
npx tsc --noEmit  # Should show no type errors

# Deploy to GitHub
git add .
git commit -m "Ready for production deployment"  
git push origin main

# Then deploy via Vercel dashboard or CLI
npx vercel --prod
```

---

## Support

### Project Structure
- **Account**: Josh-SpecChem (work account)
- **Repository**: products
- **Branch**: main
- **Build Status**: ✅ Production Ready

### Contact
- Deployment issues: Check Vercel dashboard
- Database issues: Check Supabase dashboard  
- Build issues: Review this deployment guide