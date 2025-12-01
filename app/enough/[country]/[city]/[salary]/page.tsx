// app/enough/[country]/[city]/[salary]/page.tsx
import { redirect } from "next/navigation";

type Props = {
  params: { country: string; city: string; salary: string };
};

export default function LegacyEnoughSalaryPage({ params }: Props) {
  const { country, city, salary } = params;

  const target = `/enough/${country}/${city}?salary=${encodeURIComponent(
    salary
  )}`;

  redirect(target);
}

      </Suspense>
    </main>
  );
}
