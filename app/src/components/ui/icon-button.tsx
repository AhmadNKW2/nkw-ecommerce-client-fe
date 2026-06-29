"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Heart,
  Search,
  CircleUser,
  ShoppingCart,
  Globe,
  Trash2,
  Loader2,
  X,
  Menu,
} from "lucide-react";

type BrandIconProps = React.SVGProps<SVGSVGElement>;

function FacebookIcon({ className, ...props }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon({ className, ...props }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className, ...props }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className, ...props }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const ICONS = {
  heart: Heart,
  search: Search,
  user: CircleUser,
  cart: ShoppingCart,
  globe: Globe,
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  trash: Trash2,
  x: X,
  menu: Menu,
} as const;

export type IconName = keyof typeof ICONS;

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "header" | "social" | "wishlist";
  /** Badge count for notifications */
  badge?: number;
  /** Preset icon to render */
  icon: IconName;
  /** Shape of the button */
  shape?: "square" | "circle";
  /** Active state for toggleable icons (like heart) */
  isActive?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  default: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizeClasses = {
  sm: "[&_svg]:w-4 [&_svg]:h-4",
  default: "[&_svg]:w-5 [&_svg]:h-5",
  lg: "[&_svg]:w-6 [&_svg]:h-6",
};

const variantClasses = {
  default: "bg-white/90 hover:bg-white shadow-s1 text-[var(--color-third)] hover:opacity-80",
  header: "text-white hover:text-secondary md:hover:bg-gray-100 md:hover:text-primary w-5 h-5 md:w-auto md:h-auto p-0 md:p-2 [&_svg]:w-full [&_svg]:h-full md:[&_svg]:w-5 md:[&_svg]:h-5",
  social: "bg-gray-800 hover:bg-secondary text-white hover:text-white",
  wishlist: "shadow-s1 transition-all duration-400",
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      size = "default",
      variant = "default",
      disabled,
      badge,
      icon,
      shape = "square",
      isActive,
      isLoading,
      ...props
    },
    ref
  ) => {
    let effectiveClassName = cn(variantClasses[variant], className);
    let effectiveIconClassName = "";

    if (variant === "wishlist") {
      if (isActive) {
        effectiveClassName = cn(
          variantClasses.wishlist,
          "bg-danger text-white hover:opacity-90",
          className
        );
        effectiveIconClassName = "fill-current transition-all duration-300";
      } else {
        effectiveClassName = cn(
          variantClasses.wishlist,
          "bg-white text-danger hover:bg-danger hover:text-white",
          className
        );
        effectiveIconClassName = "fill-transparent transition-all duration-300";
      }
    }

    const IconComponent = ICONS[icon];

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center transition-all duration-300",
          shape === "circle" ? "rounded-full" : "rounded-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-95",
          sizeClasses[size],
          iconSizeClasses[size],
          effectiveClassName
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <IconComponent className={effectiveIconClassName} />
        )}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-3 md:-top-1 -right-3 md:-right-1 bg-danger text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton };
