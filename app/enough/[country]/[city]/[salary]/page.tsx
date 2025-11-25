// app/enough/[country]/[city]/[salary]/page.tsx
import { redirect } from "next/navigation";

type Params = {
  country: string;
  city: string;
  salary: string;
};

export default function EnoughPrettyPage({ params }: { params: Params }) {
  const { country, city, salary } = params;

  const search = new URLSearchParams({
    country,
    city,
    salary,
  }).toString();

  redirect(`/enough?${search}`);
}
