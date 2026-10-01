import { redirect } from "next/navigation";

export default function GuestsRedirectPage() {
  redirect("/admin/guests");
}
