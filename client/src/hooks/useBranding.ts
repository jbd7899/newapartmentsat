import { useQuery } from "@tanstack/react-query";
import type { Branding } from "@shared/schema";

export function useBranding() {
  return useQuery<Branding | null>({
    queryKey: ["/api/branding"],
  });
}
