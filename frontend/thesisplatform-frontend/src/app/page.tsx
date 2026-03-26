import Image from "next/image";
import Link from "next/link";

type HomePageProps = {
  searchParams?: Promise<{
    success?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const success = params?.success;

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">
      <section className="w-full space-y-10">
        <div className="grid items-center gap-8 lg:grid-cols-[180px_minmax(0,1fr)_180px]">
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/UPM.png"
              alt="Logo de la Universidad Politécnica de Madrid"
              width={180}
              height={180}
              className="h-auto w-[110px] sm:w-[140px] lg:w-[160px]"
              priority
            />
          </div>

          <div className="space-y-6 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-gray-500">
              TFG · Plataforma de búsqueda de directores de tesis doctoral
            </p>

            <h1 className="mx-auto max-w-5xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Encuentra el perfil académico adecuado para iniciar una tesis
              doctoral
            </h1>

            <p className="mx-auto max-w-3xl text-base leading-7 text-gray-600 sm:text-lg">
              Esta plataforma facilita el contacto entre estudiantes interesados
              en realizar una tesis doctoral y profesorado con experiencia
              investigadora, mediante perfiles académicos estructurados, filtros
              de búsqueda y un sistema de compatibilidad basado en líneas de
              investigación, programas doctorales y disponibilidad.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/login"
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-900 transition hover:bg-gray-100"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-900 transition hover:bg-gray-100"
              >
                Registrarse
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Image
              src="/ETSIINF.png"
              alt="Logo de la Escuela Técnica Superior de Ingenieros Informáticos"
              width={180}
              height={180}
              className="h-auto w-[110px] sm:w-[140px] lg:w-[160px]"
              priority
            />
          </div>
        </div>

        {success === "registered" && (
          <div className="mx-auto max-w-3xl rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
            Registro completado correctamente. Ya puedes iniciar sesión.
          </div>
        )}

        {success === "logout" && (
          <div className="mx-auto max-w-3xl rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
            Sesión cerrada correctamente.
          </div>
        )}

        {success === "reset-sent" && (
          <div className="mx-auto max-w-3xl rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
            Sigue las instrucciones que se han enviado al correo electrónico que
            has introducido.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Para estudiantes
            </h2>
            <p className="text-sm leading-6 text-gray-600 sm:text-base">
              Completa tu perfil académico, indica tus intereses de
              investigación, programa doctoral, disponibilidad y preferencias, y
              consulta profesores potencialmente compatibles.
            </p>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Para profesorado
            </h2>
            <p className="text-sm leading-6 text-gray-600 sm:text-base">
              Publica tu perfil investigador, tus líneas de trabajo,
              experiencia previa en dirección y disponibilidad para supervisar
              nuevas tesis doctorales.
            </p>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Compatibilidad académica
            </h2>
            <p className="text-sm leading-6 text-gray-600 sm:text-base">
              El sistema combina búsqueda manual y compatibilidad automática
              para facilitar una primera identificación de perfiles adecuados
              antes del envío formal de solicitudes.
            </p>
          </article>
        </div>

        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            ¿Qué resuelve esta plataforma?
          </h3>
          <p className="text-sm leading-6 text-gray-600 sm:text-base">
            Centraliza en un único entorno la información académica relevante
            para que la búsqueda de dirección de tesis doctoral sea más clara,
            estructurada y eficiente, evitando procesos dispersos y poco
            transparentes.
          </p>
        </div>
      </section>
    </main>
  );
}