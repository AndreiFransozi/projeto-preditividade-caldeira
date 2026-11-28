import BoilerGrid from "./BoilerGrid";

export default function DashboardPage() {
  return (
    <div className="container">
      <BoilerGrid
        user={{
          id: "visualizacao",
          email: "visualizacao@safelife.local",
          fullName: "Visitante",
          companyName: "Prévia SafeLife AI",
          role: "Modo de visualização",
        }}
        boilers={[]}
        initialReadings={{}}
        initialRecentReadings={[]}
      />
    </div>
  );
}
