export default function EducationFooter() {
  return (
    <div className="bg-[#333] py-8 px-3">
      <div className="container mx-auto flex flex-col lg:flex-row justify-center items-center gap-6">
        <div className="max-w-[300px]">
          <img src="/educacion.png" alt="IPN Logo" className="w-full" />
        </div>
        <div className="text-[12.8px] flex flex-col text-[#ccc] text-sm gap-[10px] max-w-[900px]">
          <p>INSTITUTO POLITÉCNICO NACIONAL</p>
          <p>
            D.R. Instituto Politécnico Nacional (IPN). Av. Luis Enrique Erro
            S/N, Unidad Profesional Adolfo López Mateos, Zacatenco, Alcaldía
            Gustavo A. Madero, C.P. 07738, Ciudad de México. Conmutador: 55 57
            29 60 00 / 55 57 29 63 00.
          </p>
          <p>
            Esta página es una obra intelectual protegida por la Ley Federal del
            Derecho de Autor, puede ser reproducida con fines no lucrativos,
            siempre y cuando no se mutile, se cite la fuente completa y su
            dirección electrónica; su uso para otros fines, requiere
            autorización previa y por escrito de la Dirección General del
            Instituto.
          </p>
        </div>
      </div>
    </div>
  );
}
