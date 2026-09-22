type Props = {
  src: string;
  alt: string;
  className?: string;
  maxHeightClass?: string;
  /** Fill a parent box while keeping the whole media visible. */
  fill?: boolean;
};

function isVideoSrc(src: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(src);
}

export function FitMedia({
  src,
  alt,
  className = "",
  maxHeightClass = "max-h-[min(72vh,38rem)]",
  fill = false,
}: Props) {
  const video = isVideoSrc(src);
  const mediaClass = fill
    ? "max-h-full max-w-full h-full w-auto object-contain"
    : `${maxHeightClass} h-auto max-w-full object-contain`;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-black/40 ${
        fill ? "h-full w-full" : "w-full rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)]"
      } ${className}`}
    >
      {video ? (
        <video
          src={src}
          controls={!fill}
          muted={fill}
          playsInline
          className={mediaClass}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={mediaClass} />
      )}
    </div>
  );
}

