import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Property } from "@shared/schema";

interface Props {
  property: Property;
}

interface PhotoData {
  exterior: string[];
  interior: string[];
  amenities: string[];
}

export default function PropertyThumbnail({ property }: Props) {
  const { data } = useQuery<PhotoData>({
    queryKey: ["/api/photos/property", property.id],
    queryFn: () => apiRequest(`/api/photos/property/${property.id}`),
    staleTime: 30_000,
  });

  const featured = data?.exterior?.[0] || data?.interior?.[0] || data?.amenities?.[0];

  if (!featured) return null;

  return (
    <img
      src={featured}
      alt={`${property.name} photo`}
      className="w-10 h-10 object-cover rounded-md border"
    />
  );
}
