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
    <main className="min-h-screen px-6 py-8 sm:py-12">
      <section className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/70 backdrop-blur sm:p-8 lg:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[150px_minmax(0,1fr)_150px]">
            <div className="flex justify-center lg:justify-start">
              <Image
                src="/UPM.png"
                alt="Logo de la Universidad Politécnica de Madrid"
                width={180}
                height={180}
                className="h-auto w-[95px] sm:w-[125px] lg:w-[145px]"
                priority
              />
            </div>

            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <Image
                  src="/thesismatch-logo.jpeg"
                  alt="Logo ThesisMatch"
                  width={220}
                  height={220}
                  className="rounded-[2rem] shadow-lg shadow-blue-900/10"
                  priority
                />
              </div>

              <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                ThesisMatch · Plataforma académica
              </div>

              <h1 className="mx-auto max-w-5xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Encuentra el perfil académico adecuado para iniciar una tesis doctoral
              </h1>

              <p className="mx-auto max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                Plataforma orientada a conectar estudiantes interesados en
                realizar una tesis doctoral con profesorado afín, combinando
                perfiles estructurados, búsqueda manual y cálculo automático de
                compatibilidad académica.
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="rounded-2xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
                >
                  Iniciar sesión
                </Link>

                <Link
                  href="/register"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
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
                className="h-auto w-[95px] sm:w-[125px] lg:w-[145px]"
                priority
              />
            </div>
          </div>
        </header>

        {success === "registered" && (
          <Alert>Registro completado correctamente. Ya puedes iniciar sesión.</Alert>
        )}

        {success === "logout" && (
          <Alert>Sesión cerrada correctamente.</Alert>
        )}

        {success === "reset-sent" && (
          <Alert>
            Sigue las instrucciones que se han enviado al correo electrónico que
            has introducido.
          </Alert>
        )}

        <div className="grid gap-5 md:grid-cols-3">
          <InfoCard
            title="Para estudiantes"
            text="Crea un perfil académico completo, indica tus intereses de investigación, programas doctorales, disponibilidad y propuesta inicial de tesis."
          />

          <InfoCard
            title="Para profesorado"
            text="Publica tus líneas de investigación, programas de doctorado, experiencia en dirección y disponibilidad para supervisar nuevas tesis."
          />

          <InfoCard
            title="Compatibilidad académica"
            text="El sistema permite buscar perfiles manualmente y ordenar resultados mediante un índice de afinidad basado en criterios académicos."
          />
        </div>

        <section className="rounded-[2rem] border border-white/70 bg-slate-950 p-8 text-center text-white shadow-xl shadow-slate-300/60">
          <h2 className="mb-3 text-2xl font-bold">
            Un proceso de contacto más claro, formal y estructurado
          </h2>
          <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            La plataforma centraliza la información relevante de estudiantes y
            profesores, facilitando una primera toma de contacto académica sin
            depender de correos genéricos o búsquedas dispersas.
          </p>
        </section>
      </section>
    </main>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800 shadow-sm">
      {children}
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-lg shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl">
      <h2 className="mb-3 text-lg font-bold text-slate-950">{title}</h2>
      <p className="text-sm leading-7 text-slate-600 sm:text-base">{text}</p>
    </article>
  );
}