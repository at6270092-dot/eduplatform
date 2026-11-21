import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface EduMediaBannerProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  heightClass?: string;
}

export const EduMediaBanner: React.FC<EduMediaBannerProps> = ({
  src,
  alt,
  caption,
  className = '',
  heightClass = 'aspect-video',
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[#0B1120] ${heightClass} ${className}`}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#1E293B] p-4 text-center">
          <BookOpen className="w-7 h-7 text-[#38BDF8]" />
          <span className="text-xs font-medium text-[#94A3B8] line-clamp-1">{alt}</span>
        </div>
      )}

      {caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pt-8 pb-3">
          <p className="text-xs font-medium text-[#F8FAFC] line-clamp-1">{caption}</p>
        </div>
      )}
    </div>
  );
};
