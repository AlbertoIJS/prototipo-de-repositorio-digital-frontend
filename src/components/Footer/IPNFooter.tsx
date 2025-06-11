export default function IPNFooter() {
  return (
    <footer className="bg-[#611232] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Government Logo */}
          <div className="flex flex-col">
            <img
              src="/gobierno.svg"
              alt="Gobierno de México"
              className="w-48 h-auto mb-6"
            />
          </div>

          {/* Enlaces Column */}
          <div className="flex flex-col font-light">
            <h3 className="text-lg mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  target="_blank"
                  href="https://participa.gob.mx/"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Participa
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="http://www.ordenjuridico.gob.mx/"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Marco Jurídico
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://consultapublicamx.inai.org.mx/vut-web/"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Plataforma Nacional de Transparencia
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://alertadores.funcionpublica.gob.mx/"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Alerta
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://sidec.funcionpublica.gob.mx/"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Denuncia
                </a>
              </li>
            </ul>
          </div>

          {/* ¿Qué es gob.mx? Column */}
          <div className="flex flex-col font-light">
            <h3 className="text-lg mb-4">¿Qué es gob.mx?</h3>
            <p className="text-sm my-8">
              Es el portal único de trámites, información y participación
              ciudadana.{" "}
              <a
                target="_blank"
                href="https://www.gob.mx/que-es-gobmx"
                className="underline hover:text-gray-200 transition-colors"
              >
                Leer más
              </a>
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  target="_blank"
                  href="https://datos.gob.mx/"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Portal de datos abiertos
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://www.gob.mx/accesibilidad"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Declaración de accesibilidad
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://www.gob.mx/terminos"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://www.gob.mx/terminos#medidas-seguridad-informacion"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Política de seguridad
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://www.gob.mx/sitemap"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Mapa de sitio
                </a>
              </li>
            </ul>
          </div>

          {/* Contact and Social Media Column */}
          <div className="flex flex-col font-light">
            <div className="mb-6">
              <a
                target="_blank"
                href="https://www.gob.mx/tramites/ficha/presentacion-de-quejas-y-denuncias-en-la-sfp/SFP54"
                className="text-white hover:text-gray-200 transition-colors text-sm"
              >
                Denuncia contra servidores públicos
              </a>
            </div>

            <div>
              <h3 className="text-lg mb-4 font-light">Síguenos en</h3>
              <div className="flex items-center space-x-4">
                <a
                  target="_blank"
                  href="https://www.facebook.com/gobmexico"
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-6 h-6"
                    fill="#fff"
                    viewBox="-5 0 20 20"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <defs> </defs>
                      <g
                        id="Page-1"
                        stroke="none"
                        stroke-width="1"
                        fill="none"
                        fill-rule="evenodd"
                      >
                        <g
                          id="Dribbble-Light-Preview"
                          transform="translate(-385.000000, -7399.000000)"
                          fill="#fff"
                        >
                          <g
                            id="icons"
                            transform="translate(56.000000, 160.000000)"
                          >
                            <path
                              d="M335.821282,7259 L335.821282,7250 L338.553693,7250 L339,7246 L335.821282,7246 L335.821282,7244.052 C335.821282,7243.022 335.847593,7242 337.286884,7242 L338.744689,7242 L338.744689,7239.14 C338.744689,7239.097 337.492497,7239 336.225687,7239 C333.580004,7239 331.923407,7240.657 331.923407,7243.7 L331.923407,7246 L329,7246 L329,7250 L331.923407,7250 L331.923407,7259 L335.821282,7259 Z"
                              id="facebook-[#176]"
                            ></path>
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg>
                </a>
                <a
                  target="_blank"
                  href="https://twitter.com/GobiernoMX"
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="Twitter"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="w-6 h-6"
                    fill="currentColor"
                  >
                    <g>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </g>
                  </svg>
                </a>
                <a
                  target="_blank"
                  href="https://www.instagram.com/gobmexico/"
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path d="M20.445 5h-8.891A6.559 6.559 0 0 0 5 11.554v8.891A6.559 6.559 0 0 0 11.554 27h8.891a6.56 6.56 0 0 0 6.554-6.555v-8.891A6.557 6.557 0 0 0 20.445 5zm4.342 15.445a4.343 4.343 0 0 1-4.342 4.342h-8.891a4.341 4.341 0 0 1-4.341-4.342v-8.891a4.34 4.34 0 0 1 4.341-4.341h8.891a4.342 4.342 0 0 1 4.341 4.341l.001 8.891z"></path>
                      <path d="M16 10.312c-3.138 0-5.688 2.551-5.688 5.688s2.551 5.688 5.688 5.688 5.688-2.551 5.688-5.688-2.55-5.688-5.688-5.688zm0 9.163a3.475 3.475 0 1 1-.001-6.95 3.475 3.475 0 0 1 .001 6.95zM21.7 8.991a1.363 1.363 0 1 1-1.364 1.364c0-.752.51-1.364 1.364-1.364z"></path>
                    </g>
                  </svg>
                </a>
                <a
                  target="_blank"
                  href="https://www.youtube.com/@gobiernodemexico"
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="YouTube"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
