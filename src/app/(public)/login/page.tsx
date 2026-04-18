// Página: /login
// Inicio de sesión para admin/recepcionista via Supabase Auth
export default function LoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Iniciar Sesión
        </h1>
        {/* TODO: FormularioLogin — email + password → Supabase Auth */}
      </div>
    </section>
  );
}
