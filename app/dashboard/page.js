import { createClient } from "@/lib/supabase/server";
import BoilerGrid from "./BoilerGrid";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: boilers } = await supabase
    .from("boilers")
    .select("*")
    .order("name");

  // Última leitura de cada caldeira (view criada no schema.sql)
  const { data: latest } = await supabase
    .from("latest_readings")
    .select("*");

  const initialReadings = Object.fromEntries(
    (latest ?? []).map((r) => [r.boiler_id, r])
  );

  return (
    <div className="container">
      <div className="topbar">
        <img
          className="brand-logo"
          src="/safelife-ai-logo.jpeg"
          alt="SafeLife AI"
        />
        <LogoutButton />
      </div>

      <BoilerGrid boilers={boilers ?? []} initialReadings={initialReadings} />
    </div>
  );
}
