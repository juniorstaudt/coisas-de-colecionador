import { useEffect, useState } from "react";

import { getCachedImageUrl, getImageUrl } from "@/lib/image-store";

/** Resolves a device-stored image id to a displayable URL. */
export function useImageUrl(id: string | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() => (id ? getCachedImageUrl(id) : undefined));

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setUrl(undefined);
      return;
    }
    getImageUrl(id)
      .then((u) => !cancelled && setUrl(u))
      .catch(() => !cancelled && setUrl(undefined));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return url;
}
