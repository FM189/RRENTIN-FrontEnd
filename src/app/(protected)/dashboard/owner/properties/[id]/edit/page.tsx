import { notFound } from "next/navigation";
import { getPropertyForEdit } from "@/actions/properties";
import EditPropertyContent from "@/components/properties/edit/EditPropertyContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getPropertyForEdit(id);
  if (!property) notFound();

  return <EditPropertyContent property={property} />;
}
