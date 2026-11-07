import { useEffect } from "react";
import { Link, useRouteError } from "react-router-dom";

const RELOAD_FLAG = "ostra.chunkReload";

/**
 * After a new deploy, an open tab may request code-split chunks whose hashed filenames
 * no longer exist. Reload once to pick up the new build; show a friendly error otherwise.
 */
export default function RouteError() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : String(error);
  const isStaleChunk = /dynamically imported module|Importing a module script failed|error loading dynamically imported/i.test(message);

  useEffect(() => {
    if (!isStaleChunk) return;
    try {
      if (sessionStorage.getItem(RELOAD_FLAG)) return;
      sessionStorage.setItem(RELOAD_FLAG, "1");
    } catch {
      /* storage blocked: still try a single reload */
    }
    window.location.reload();
  }, [isStaleChunk]);

  return (
    <div className="narrow empty" role="alert">
      <h1 className="display-sm">{isStaleChunk ? "Updating Ostra…" : "Something went wrong."}</h1>
      <p className="muted">{isStaleChunk ? "A newer version was just released. Reloading the page." : "Please try again. If it keeps happening, head back to the shop."}</p>
      <Link to="/shop" className="btn btn--primary" reloadDocument>
        Back to the shop
      </Link>
    </div>
  );
}
