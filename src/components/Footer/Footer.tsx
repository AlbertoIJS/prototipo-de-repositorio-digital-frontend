import { LibraryBig } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <img
          src="/ipn.png"
          alt=""
          className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
          width={100}
          height={100}
        />

        <div className="flex flex-col gap-2 text-center md:text-left md:mr-auto md:mb-8">
          <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
            <LibraryBig className="w-6 h-6" />
            <h3 className="text-xl sm:text-2xl font-bold">Repositorio ESCOM</h3>
          </div>
          <h4 className="font-bold">Alumnos</h4>
          <ul className="flex flex-col gap-2 text-sm text-gray-500">
            <li>Alberto Isaac Jurado Santos</li>
            <li>Ávila Juárez Alexis Aramis</li>
            <li>Gutiérrez Victorio Axel Jair</li>
          </ul>
        </div>
        <img
          src="/escom.png"
          alt=""
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain"
          width={100}
          height={100}
        />
      </div>
      <p className="text-center text-sm text-gray-500 mx-auto mt-8 px-4">
        Se distribuyen bajo una{" "}
        <Link
          href="https://creativecommons.org/licenses/by-nc/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Licencia Creative Commons Atribución-NoComercial 4.0 Internacional.
        </Link>
      </p>
    </footer>
  );
}
