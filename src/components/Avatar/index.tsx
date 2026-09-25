import {useEffect, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.css';

/**
 * A small round portrait.
 *
 * If the image file is missing the component falls back to a visible
 * placeholder rather than a broken-image icon, so the page is presentable
 * before the photo is added and the build never depends on a binary that is
 * not in the repository yet.
 */
export default function Avatar({
  src,
  alt,
  size = 96,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}): ReactNode {
  const [missing, setMissing] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const url = useBaseUrl(src);

  // The server-rendered <img> can finish failing before React attaches the
  // onError listener, in which case the event is missed entirely. A complete
  // image with no intrinsic width is one that failed, so check on mount too.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setMissing(true);
    }
  }, []);

  if (missing) {
    return (
      <div
        className={clsx(styles.missing, className)}
        style={{width: size, height: size}}
        role="img"
        aria-label={`Placeholder: ${src} has not been added yet`}>
        TODO
        <br />
        photo
      </div>
    );
  }

  return (
    <img
      ref={ref}
      className={clsx(styles.avatar, className)}
      src={url}
      alt={alt}
      width={size}
      height={size}
      style={{width: size, height: size}}
      loading="lazy"
      onError={() => setMissing(true)}
    />
  );
}
