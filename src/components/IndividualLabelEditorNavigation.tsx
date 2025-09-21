'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileEdit, ExternalLink, Database, CheckCircle, AlertCircle } from 'lucide-react';

export function IndividualLabelEditorNavigation() {
  const [initializing, setInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const handleInitialize = async () => {
    setInitializing(true);
    setInitError(null);
    
    try {
      const response = await fetch('/api/individual-label-editor/init', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInitialized(true);
      } else {
        setInitError(result.error || 'Failed to initialize');
      }
    } catch (error) {
      setInitError('Network error during initialization');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileEdit className="h-5 w-5" />
          Individual Label Editor
          <Badge variant="secondary">New Feature</Badge>
        </CardTitle>
        <CardDescription>
          Create individual label customizations that override general templates for specific products.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">What this does:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Allows individual products to have completely custom CSS</li>
            <li>• Individual edits become authoritative and override all templates</li>
            <li>• Supports both 14x7 and 5x9 label sizes independently</li>
            <li>• Leaves general templates intact for products without individual edits</li>
            <li>• Provides easy revert-to-template functionality</li>
          </ul>
        </div>

        <div className="flex gap-2 pt-4">
          {!initialized ? (
            <Button 
              onClick={handleInitialize}
              disabled={initializing}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {initializing ? 'Initializing...' : 'Initialize System'}
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">System Ready</span>
            </div>
          )}
          
          <Link href="/new-label-editor">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Editor
            </Button>
          </Link>
        </div>

        {initError && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{initError}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
