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
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6">
      <section className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
          TFG · Plataforma de búsqueda de directores de tesis doctoral
        </p>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
          Encuentra directores y doctorandos compatibles según líneas de
          investigación, programas doctorales y disponibilidad.
        </h1>

        <p className="max-w-2xl text-base text-gray-600 sm:text-lg">
          Esta plataforma conecta estudiantes y profesores mediante perfiles
          académicos estructurados, búsquedas manuales y un sistema de matching
          automático.
        </p>

        {success === "registered" && (
          <div className="max-w-2xl rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
            Registro completado correctamente. Ya puedes iniciar sesión.
          </div>
        )}

        {success === "logout" && (
          <div className="max-w-2xl rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
            Sesión cerrada correctamente.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-xl border px-5 py-3 font-medium transition hover:bg-gray-50"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/register"
            className="rounded-xl border px-5 py-3 font-medium transition hover:bg-gray-50"
          >
            Registrarse
          </Link>
        </div>
      </section>
    </main>
  );
}