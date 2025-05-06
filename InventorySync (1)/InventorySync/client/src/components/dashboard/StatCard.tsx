import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number | null;
  isLoading?: boolean;
}

export default function StatCard({ title, value, isLoading = false }: StatCardProps) {
  return (
    <Card className="border border-neutral-200">
      <CardContent className="p-5">
        <h3 className="text-sm font-medium text-neutral-500 mb-1">{title}</h3>
        {isLoading ? (
          <Skeleton className="h-9 w-12" />
        ) : (
          <p className="text-3xl font-semibold text-neutral-800">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
