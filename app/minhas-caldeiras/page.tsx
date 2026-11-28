import type { Metadata } from "next";
import MinhasCaldeiras from "@/components/caldeira/MinhasCaldeiras";

export const metadata: Metadata = {
  title: "Minhas Caldeiras",
  description: "Acompanhe inspeções e integridade das suas caldeiras.",
};

export default function MinhasCaldeirasPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <MinhasCaldeiras />
      </div>
    </main>
  );
}
