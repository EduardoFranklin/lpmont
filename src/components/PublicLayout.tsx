import useTrackingScripts from "@/hooks/useTrackingScripts";
import useUtmCapture from "@/hooks/useUtmCapture";
import { Outlet } from "react-router-dom";

/**
 * Wraps all public-facing routes to inject tracking pixels and capture UTMs.
 */
const PublicLayout = () => {
  useTrackingScripts();
  useUtmCapture();
  return <Outlet />;
};

export default PublicLayout;
