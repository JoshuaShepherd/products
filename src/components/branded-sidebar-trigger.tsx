"use client";

import { useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BrandedSidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function BrandedSidebarTrigger({ className = "", ...props }: BrandedSidebarTriggerProps) {
  const { open, setOpen } = useSidebar();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      {/* Clickable Logo - goes to home */}
      <Link 
        href="/"
        className="p-2 rounded-lg hover:bg-accent/20 transition-all duration-200 hover:scale-105 cursor-pointer z-50"
        aria-label="Go to home"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => {
          e.preventDefault();
          router.push('/');
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="currentColor"
            opacity="0.1"
          />
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </Link>
      
      {/* Sidebar Toggle */}
      <button
        className={`p-2 rounded-lg hover:bg-accent/20 transition-all duration-200 hover:scale-105 ${className}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
        {...props}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className={`transition-transform duration-300 ${!open ? "scale-x-[-1]" : ""}`}
        >
          <path
            d="M14 7L9 12L14 17"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            opacity="0.2"
          />
        </svg>
      </button>
    </div>
  );
}
