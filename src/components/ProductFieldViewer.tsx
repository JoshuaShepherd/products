import React from "react";

// Use Tailwind's prose class for pretty typography
export function ProductFieldViewer({ value }: { value: string }) {
  return (
    <div
      className="prose prose-gray dark:prose-invert max-w-none prose-sm"
      dangerouslySetInnerHTML={{ __html: value || "" }}
    />
  );
}

export default ProductFieldViewer;
