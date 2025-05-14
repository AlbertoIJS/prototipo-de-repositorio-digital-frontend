import { Navbar } from "@/components/Navbar";
import MaterialsGrid from "../components/MaterialsGrid";


export default function Home() {
  return (
    <div className="min-h-svh flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4 container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Más recientes</h1>
        <MaterialsGrid />
      </main>
    </div>
  );
}
