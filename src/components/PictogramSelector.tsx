import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

// Available pictograms with their URLs and names
const AVAILABLE_PICTOGRAMS = [
  {
    id: 'corrosion',
    name: 'Corrosion',
    url: 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fcorrosion.png?alt=media&token=2f651653-221f-45a8-9a02-feba14900d9e'
  },
  {
    id: 'environmental-hazard',
    name: 'Environmental Hazard',
    url: 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fenvironmental-hazard.png?alt=media&token=6bca89fe-4727-4d17-b3e6-c52e36a6be53'
  },
  {
    id: 'exclamation',
    name: 'Exclamation',
    url: 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fexclamation.png?alt=media&token=a0120ae4-b4d0-482c-aca9-1400dbd294b9'
  },
  {
    id: 'exploding-bomb',
    name: 'Exploding Bomb',
    url: 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fexploding-bomb.png?alt=media&token=2f215e08-37d5-43df-bea4-7231820da4d2'
  },
  {
    id: 'flame-over-circle',
    name: 'Flame Over Circle',
    url: 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fflame-over-circle.png?alt=media&token=45fcacc1-5071-4c30-a120-b171dcbe632b'
  },
  {
    id: 'flame',
    name: 'Flame',
    url: 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fflame.png?alt=media&token=3691deab-dcab-4803-8c2b-150c141e95a1'
  },
  {
    id: 'gas-cylinder',
    name: 'Gas Cylinder',
    url: 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fgas-cylinder.png?alt=media&token=20016718-dfb0-4d2c-972e-69957dc3bd34'
  },
  {
    id: 'health-hazard',
    name: 'Health Hazard',
    url: 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fhealth-hazard.png?alt=media&token=6afae00b-0abb-47d6-9740-364dd060e28e'
  },
  {
    id: 'skull-and-crossbones',
    name: 'Skull and Crossbones',
    url: 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fskull-and-crossbones.png?alt=media&token=48e2b74a-1818-4a87-80ff-f76674e8e6ce'
  }
];

interface PictogramSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

// Helper function to extract URLs from the pictograms field value
function extractUrls(value: string): string[] {
  if (!value) return [];
  
  // Decode HTML entities first
  const decodedValue = value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Handle both HTML format and plain URLs
  if (decodedValue.includes('<img')) {
    // Extract URLs from HTML img tags
    const imgRegex = /src="([^"]+)"/g;
    const urls: string[] = [];
    let match;
    while ((match = imgRegex.exec(decodedValue)) !== null) {
      urls.push(match[1]);
    }
    return urls;
  }
  
  // Handle plain URLs separated by commas or newlines
  return decodedValue.split(/[,\n]/)
    .map(url => url.trim())
    .filter(Boolean);
}

// Helper function to create HTML format from URLs
function createHtmlFromUrls(urls: string[]): string {
  if (urls.length === 0) return '';
  
  return urls.map(url => 
    `<img src="${url}" alt="Pictogram" style="max-width: 48px; margin-right: 8px; display: inline-block; vertical-align: middle;">`
  ).join(' ');
}

export function PictogramSelector({ value, onChange }: PictogramSelectorProps) {
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  // Initialize selected URLs from the current value
  useEffect(() => {
    const urls = extractUrls(value);
    setSelectedUrls(urls);
  }, [value]);

  const handlePictogramToggle = (pictogram: typeof AVAILABLE_PICTOGRAMS[0]) => {
    const isSelected = selectedUrls.includes(pictogram.url);
    let newUrls: string[];
    
    if (isSelected) {
      newUrls = selectedUrls.filter(url => url !== pictogram.url);
    } else {
      newUrls = [...selectedUrls, pictogram.url];
    }
    
    setSelectedUrls(newUrls);
    
    // Update the parent component with HTML format
    const htmlValue = createHtmlFromUrls(newUrls);
    onChange(htmlValue);
  };

  return (
    <div className="space-y-4">
      {/* Current Selection Display */}
      {selectedUrls.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
            Selected Pictograms ({selectedUrls.length})
          </h4>
          <div className="flex gap-3 flex-wrap">
            {selectedUrls.map((url, index) => {
              const pictogram = AVAILABLE_PICTOGRAMS.find(p => p.url === url);
              return (
                <div key={`selected-${index}`} className="relative group">
                  <img
                    src={url}
                    alt={pictogram?.name || 'Pictogram'}
                    className="w-12 h-12 rounded border-2 border-blue-300 dark:border-blue-600"
                  />
                  <button
                    onClick={() => handlePictogramToggle(pictogram || { id: 'unknown', name: 'Unknown', url })}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove pictogram"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pictogram Selection Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Available Pictograms
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {AVAILABLE_PICTOGRAMS.map((pictogram) => {
            const isSelected = selectedUrls.includes(pictogram.url);
            
            return (
              <button
                key={pictogram.id}
                onClick={() => handlePictogramToggle(pictogram)}
                className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                title={`Toggle ${pictogram.name}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={pictogram.url}
                    alt={pictogram.name}
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-xs text-center text-gray-600 dark:text-gray-400 font-medium leading-tight">
                    {pictogram.name}
                  </span>
                </div>
                
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
        <p>
          <strong>Instructions:</strong> Click pictograms to add or remove them. 
          Selected pictograms will appear on product labels and in the database as HTML.
        </p>
      </div>
    </div>
  );
}

// Component for displaying pictograms in view mode
interface PictogramDisplayProps {
  value: string;
}

export function PictogramDisplay({ value }: PictogramDisplayProps) {
  const urls = extractUrls(value);
  
  if (urls.length === 0) {
    return (
      <div className="text-gray-400 italic p-4 text-center">
        No pictograms selected
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        {urls.map((url, index) => {
          const pictogram = AVAILABLE_PICTOGRAMS.find(p => p.url === url);
          
          return (
            <div key={`display-${index}`} className="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <img
                src={url}
                alt={pictogram?.name || 'Pictogram'}
                className="w-12 h-12 object-contain"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                {pictogram?.name || 'Unknown'}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {urls.length} pictogram{urls.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
}

export { AVAILABLE_PICTOGRAMS };
