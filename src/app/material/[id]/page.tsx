import { MaterialDetails } from "@/components/MaterialDetails";

export default function MaterialPage({ params }: { params: { id: string } }) {
  return <MaterialDetails id={params.id} />;
} 