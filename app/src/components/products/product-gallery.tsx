"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  wishlistButton?: React.ReactNode;
  initialIndex?: number;
  showThumbnails?: boolean;
  showMainImage?: boolean;
  selectedIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function ProductGallery({
  images,
  productName,
  wishlistButton,
  initialIndex = 0,
  showThumbnails = true,
  showMainImage = true,
  selectedIndex: controlledIndex,
  onIndexChange
}: ProductGalleryProps) {
  const [internalIndex, setInternalIndex] = useState(initialIndex);
  const selectedIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const setSelectedIndex = useCallback((index: number | ((prev: number) => number)) => {
    if (onIndexChange) {
      if (typeof index === 'function') {
        const next = index(selectedIndex);
        onIndexChange(next);
      } else {
        onIndexChange(index);
      }
    } else {
      setInternalIndex(index);
    }
  }, [onIndexChange, selectedIndex]);

  const [showZoomModal, setShowZoomModal] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [thumbnailSize, setThumbnailSize] = useState<number | null>(null);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = thumbnailContainerRef.current;
    if (!container || !showMainImage) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const isMobile = window.innerWidth < 768;
        
        let availableSpace = isMobile ? entry.contentRect.width : entry.contentRect.height;
        if (availableSpace <= 0) continue;

        const idealSize = 64; 
        const gap = isMobile ? 12 : 16;
        
        let count = Math.round((availableSpace + gap) / (idealSize + gap));
        if (count < 1) count = 1;

        availableSpace = availableSpace - (isMobile ? 16 : 16); // padding p-2 is 8px each side
        const exactSize = (availableSpace - (count - 1) * gap) / count;
        setThumbnailSize(exactSize);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [showMainImage]);

  const handlePrevious = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();

    setDirection('right');
    setIsAnimating(true);
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setDirection(null);
    }, 500);
  }, [images.length, isAnimating]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();

    setDirection('left');
    setIsAnimating(true);
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setDirection(null);
    }, 500);
  }, [images.length, isAnimating]);

  const handleThumbnailClick = useCallback((index: number) => {
    if (index === selectedIndex) return;

    setDirection(index > selectedIndex ? 'left' : 'right');
    setIsAnimating(true);
    setSelectedIndex(index);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setDirection(null);
    }, 500);
  }, [selectedIndex, isAnimating]);

  const handleImageClick = useCallback(() => {
    setShowZoomModal(true);
  }, []);

  const closeZoomModal = useCallback(() => {
    setShowZoomModal(false);
  }, []);

  useEffect(() => {
    if (!showZoomModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeZoomModal();
    };

    document.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [showZoomModal, closeZoomModal]);

  // Touch handling for swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  const handleScroll = useCallback(() => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    setShowScrollUp(container.scrollTop > 0);
    setShowScrollDown(
      container.scrollTop < container.scrollHeight - container.clientHeight - 5
    );
  }, []);

  const scrollThumbnails = useCallback((scrollDirection: 'up' | 'down') => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    // Dynamically calculate the scroll amount based on single thumbnail size + gap
    const firstChild = container.children[0] as HTMLElement;
    const itemHeight = firstChild ? firstChild.getBoundingClientRect().height : 64;
    const gap = 16;
    const scrollAmount = itemHeight + gap;
    
    // Snap to nearest item
    let currentItemIndex = Math.round(container.scrollTop / scrollAmount);
    let newIndex = scrollDirection === 'up' ? currentItemIndex - 1 : currentItemIndex + 1;
    let newScrollTop = newIndex * scrollAmount;
    newScrollTop = Math.max(0, Math.min(newScrollTop, container.scrollHeight - container.clientHeight));
    container.scrollTo({ top: newScrollTop, behavior: 'smooth' });
  }, []);

  const checkScrollPosition = useCallback(() => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    setShowScrollUp(container.scrollTop > 0);
    setShowScrollDown(
      container.scrollHeight > container.clientHeight &&
      container.scrollTop < container.scrollHeight - container.clientHeight - 5
    );
  }, []);

  useEffect(() => {
    checkScrollPosition();
    const timer = setTimeout(checkScrollPosition, 100);
    return () => clearTimeout(timer);
  }, [images.length, checkScrollPosition]);

  useEffect(() => {
    setSelectedIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className={cn(
        "relative",
        // Mobile: Flex to control order easily. Desktop: Grid to strongly constrain heights
        showThumbnails && showMainImage && images.length > 1 ? "flex flex-col md:grid md:grid-cols-[4.5rem_1fr] lg:grid-cols-[5rem_1fr] gap-4 md:gap-6" : "block"
      )}
      >
        {/* Thumbnails (Left side on Desktop, Bottom on Mobile) */}
        {showThumbnails && images.length > 1 && (
          <div className={cn(
            "relative group shrink-0",
            // Desktop: Side bar strict height constraint (h-0 min-h-full forces it to match sibling height)
            showMainImage && "md:h-0 md:min-h-full md:w-full",
            // Mobile: Row below image
            showMainImage && "w-full h-20 order-2 md:order-none"
          )}>
            {/* Desktop Inner Wrapper for position absolute to strictly contain overflow within the grid row */}
            <div className={cn(
              "w-full h-full",
              showMainImage && "md:absolute md:inset-0"
            )}>
              {/* Scroll Up Arrow */}
              {showScrollUp && showMainImage && (
                <button
                  onClick={() => scrollThumbnails('up')}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md transition-all duration-300 flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-primary md:flex hidden"
                  aria-label="Scroll up"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              )}

              {/* Thumbnail Container */}
              <div
                ref={thumbnailContainerRef}
                onScroll={handleScroll}
                className={cn(
                  "overflow-y-auto scrollbar-hide flex",
                  // padding is vital to give the focus rings room so they aren't masked by flex container bounds
                  showMainImage && "p-2 mx-1",
                  // Desktop: Vertical column
                  showMainImage ? "md:flex-col md:gap-4 md:h-full md:items-center" : "",
                  // Mobile: Horizontal row
                  showMainImage ? "flex-row gap-3 overflow-x-auto w-full h-full" : "",
                  // Standalone thumbnails
                  !showMainImage && "flex-row gap-2 overflow-x-auto w-full",
                )}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleThumbnailClick(index)}
                    aria-label={`Gallery thumbnail ${index + 1} of ${images.length}`}
                    style={thumbnailSize && showMainImage ? { width: thumbnailSize, height: thumbnailSize } : undefined}
                    className={cn(
                      "relative rounded-lg overflow-hidden shrink-0 ring-2 transition-all duration-300",
                      // Desktop size
                      showMainImage ? "md:w-16 md:h-16 lg:w-16 lg:h-16" : "w-16 h-16",
                      // Mobile size
                      showMainImage ? "w-16 h-16" : "",
                      selectedIndex === index
                        ? "ring-primary ring-offset-2 opacity-100 scale-105"
                        : "opacity-60 ring-gray-200 hover:opacity-100 hover:ring-primary/50 hover:scale-105"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${productName} - Thumbnail ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>

              {/* Scroll Down Arrow */}
              {showScrollDown && showMainImage && (
                <button
                  onClick={() => scrollThumbnails('down')}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md transition-all duration-300 flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-primary md:flex hidden"
                  aria-label="Scroll down"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Image */}
        {showMainImage && (
        <div
          className={cn(
            "relative w-full aspect-square rounded-3xl bg-gray-50 overflow-hidden group cursor-zoom-in border border-secondary/20",
            // Mobile: Main Image FIRST (order-1)
            "order-1 md:order-none"
          )}
          onClick={handleImageClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Image Container with Animation */}
          <div className="relative w-full h-full">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 w-full h-full transition-all duration-500 ease-in-out",
                  selectedIndex === index && !direction && "opacity-100 translate-x-0 scale-100",
                  selectedIndex === index && direction === 'left' && "opacity-100 translate-x-0 scale-100 animate-slide-in-left",
                  selectedIndex === index && direction === 'right' && "opacity-100 translate-x-0 scale-100 animate-slide-in-right",
                  selectedIndex !== index && direction === 'left' && "opacity-0 -translate-x-full scale-95",
                  selectedIndex !== index && direction === 'right' && "opacity-0 translate-x-full scale-95",
                  selectedIndex !== index && !direction && index < selectedIndex && "opacity-0 -translate-x-full scale-95",
                  selectedIndex !== index && !direction && direction === 'right' && "opacity-0 translate-x-full scale-95",
                  selectedIndex !== index && !direction && index < selectedIndex && "opacity-0 -translate-x-full scale-95",
                  selectedIndex !== index && !direction && index > selectedIndex && "opacity-0 translate-x-full scale-95"
                )}
                style={{
                  zIndex: selectedIndex === index ? 1 : 0,
                }}
              >
                <Image
                  src={image}
                  alt={`${productName} - Image ${index + 1}`}
                  fill
                  className="object-contain object-top p-4"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Wishlist Button - Top Right */}
          {wishlistButton && (
            <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
              {wishlistButton}
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                disabled={isAnimating}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                disabled={isAnimating}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm z-10 transition-opacity duration-300">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {showZoomModal && (
          <motion.div
            key="product-gallery-zoom"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/*
              Fixed blur radius + opacity fade only. Animating blur(0→N) is what
              caused the noisy/instant snap in Chromium.
            */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              variants={{
                closed: { opacity: 0 },
                open: { opacity: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={closeZoomModal}
            />

            {/* pointer-events-none so empty area clicks hit the backdrop and close */}
            <motion.div
              className="relative z-10 flex max-h-full w-full max-w-6xl pointer-events-none flex-col items-center justify-center"
              variants={{
                closed: { opacity: 0, scale: 0.96 },
                open: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Square frame so the border hugs the image */}
              <div
                className="relative aspect-square w-full max-w-[min(100%,75vh)] pointer-events-auto overflow-hidden rounded-lg border border-secondary/50 bg-black/10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={closeZoomModal}
                  className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950/75 text-white shadow-lg ring-1 ring-white/40 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-neutral-950/90 hover:ring-white/60"
                  aria-label="Close modal"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {images.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "absolute inset-0 h-full w-full transition-all duration-500 ease-in-out",
                      selectedIndex === index && !direction && "translate-x-0 scale-100 opacity-100",
                      selectedIndex === index && direction === "left" && "animate-slide-in-left translate-x-0 scale-100 opacity-100",
                      selectedIndex === index && direction === "right" && "animate-slide-in-right translate-x-0 scale-100 opacity-100",
                      selectedIndex !== index && index < selectedIndex && "-translate-x-full scale-95 opacity-0",
                      selectedIndex !== index && index > selectedIndex && "translate-x-full scale-95 opacity-0"
                    )}
                    style={{
                      zIndex: selectedIndex === index ? 1 : 0,
                    }}
                  >
                    <Image
                      src={image}
                      alt={`${productName} - Large View`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                ))}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={isAnimating}
                      className="absolute left-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/75 text-white shadow-lg ring-1 ring-white/40 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-neutral-950/90 hover:ring-white/60 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Previous image"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isAnimating}
                      className="absolute right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/75 text-white shadow-lg ring-1 ring-white/40 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-neutral-950/90 hover:ring-white/60 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Next image"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails in Modal */}
              {images.length > 1 && (
                <div
                  className="z-50 mt-4 flex max-w-full gap-2 overflow-x-auto px-4 py-2 pointer-events-auto scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleThumbnailClick(index)}
                      aria-label={`Gallery thumbnail ${index + 1} of ${images.length}`}
                      className={cn(
                        "relative h-16 w-16 shrink-0 overflow-hidden rounded-md transition-all duration-300",
                        selectedIndex === index
                          ? "scale-110 opacity-100 ring-2 ring-white"
                          : "opacity-50 hover:scale-105 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${productName} - Thumbnail ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(-100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}