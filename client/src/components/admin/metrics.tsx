import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import type { Property, Unit, LeadSubmission } from "@shared/schema";

interface MetricsProps {
  properties?: Property[];
  units?: Unit[];
  leads?: LeadSubmission[];
}

export default function Metrics({ properties = [], units = [], leads = [] }: MetricsProps) {
  const occupancy = useMemo(() => {
    if (units.length === 0) return 0;
    const available = units.filter((u) => u.isAvailable).length;
    return Math.round(((units.length - available) / units.length) * 100);
  }, [units]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Properties</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{properties.length}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Occupancy Rate</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{occupancy}%</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{leads.length}</CardContent>
      </Card>
    </div>
  );
}
