import { useEffect, useRef, useState } from 'react';

import { useHeadingProvider } from './useHeadingProvider';

export interface HeadingState {
  /** Rumbo del dispositivo en grados, o `null` si no hay magnetómetro. */
  heading: number | null;
  available: boolean;
}

/** Suscribe al rumbo del dispositivo mientras el componente esté montado. */
export function useHeading(enabled = true): HeadingState {
  const provider = useHeadingProvider();

  const [heading, setHeading] = useState<number | null>(null);
  const [available, setAvailable] = useState(false);
  const headingRef = useRef(heading);
  const availableRef = useRef(available);
  headingRef.current = heading;
  availableRef.current = available;

  useEffect(() => {
    if (!enabled) {
      if (availableRef.current) setAvailable(false);
      if (headingRef.current !== null) setHeading(null);
      return;
    }

    if (availableRef.current) setAvailable(false);
    if (headingRef.current !== null) setHeading(null);

    let active = true;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const isAvailable = await provider.isAvailable();
      if (!active) return;

      setAvailable(isAvailable);
      if (!isAvailable) return;

      unsubscribe = provider.watchHeading((degrees) => {
        if (active) setHeading(degrees);
      });
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [provider, enabled]);

  return { heading, available };
}
