import { notFound } from "next/navigation";
import { fetchUser } from "@/lib/data";
import UpdateForm from "@/components/User/updateForm";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await fetchUser(id);

  if (!user) {
    notFound();
  }

  return <UpdateForm user={user} />;
}
