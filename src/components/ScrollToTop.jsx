import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Wait for the AnimatePresence exit animation (0.18s) to complete
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 200);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
