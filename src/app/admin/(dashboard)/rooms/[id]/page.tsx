import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EditRoomClient from "./EditRoomClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const resolvedParams = await params;

  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (error || !room) {
    notFound();
  }

  return <EditRoomClient initialRoom={room} />;
}
