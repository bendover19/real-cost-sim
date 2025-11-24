import { cityConfig } from "../../cityConfig";

export default function EnoughPage({ params }: { params: { country: string; city: string; salary: string }}) {
  const { country, city, salary } = params;

  const config = cityConfig[country]?.[city];

  if (!config) {
    return <div>Unknown city — not in config.</div>;
  }

  const salaryNum = Number(salary);
  const enough = salaryNum >= config.enoughSalary;

  return (
    <main style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Is {salaryNum.toLocaleString()} enough to live in {city}?</h1>
      <h2>{enough ? "Yes — probably" : "Probably not"}</h2>

      <p>
        Typical rent in <strong>{city}</strong> is <strong>{config.rent}</strong> / month.
      </p>

      <p>
        Most residents need around <strong>{config.enoughSalary}</strong> per year to live 
        without financial stress.
      </p>

      <p>
        You entered: <strong>{salaryNum}</strong>.
      </p>
    </main>
  );
}
