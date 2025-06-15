import { useEffect } from "react";
import { useBranding } from "./useBranding";

export function useApplyBranding() {
  const { data: branding } = useBranding();

  useEffect(() => {
    if (branding?.primaryColor) {
      document.documentElement.style.setProperty(
        "--primary",
        branding.primaryColor,
      );
    }
    if (branding?.secondaryColor) {
      document.documentElement.style.setProperty(
        "--secondary",
        branding.secondaryColor,
      );
    }
  }, [branding?.primaryColor, branding?.secondaryColor]);
}
