import { useEffect } from "react";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Ostra` : "Ostra · Objects for slower days";
  }, [title]);
}
