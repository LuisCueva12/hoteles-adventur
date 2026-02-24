import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            ¡Bienvenido!
          </h1>
          <p className="text-gray-600">
            Has iniciado sesión correctamente
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <p className="text-sm text-gray-500">Email:</p>
          <p className="text-lg font-semibold text-gray-800">{user.email}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <p className="text-sm text-gray-500">ID de Usuario:</p>
          <p className="text-xs font-mono text-gray-800 break-all">{user.id}</p>
        </div>

        <form action={handleSignOut}>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Cerrar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}