'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FabricaModulos } from '@/lib/factories/FabricaModulos';
import { crearClienteSupabaseNavegador } from '@/lib/supabase/cliente';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const db = crearClienteSupabaseNavegador();
      const auth = FabricaModulos.obtenerCasosUsoAuth(db);
      
      await auth.login(email, password);
      
      toast.success('¡Bienvenido de nuevo!', {
        description: 'Redirigiendo al panel de administración...'
      });

      router.push('/admin');
      router.refresh();
    } catch (error: any) {
      toast.error('Error de autenticación', {
        description: error.message || 'Verifica tus credenciales e intenta de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white/80 shadow-2xl backdrop-blur-xl">
        <div className="bg-primary p-10 text-center text-white">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-md">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Adventur</h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/50">Control de Acceso</p>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email corporativo</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-gray-50 bg-gray-50/50 py-4 pl-12 pr-4 text-sm font-medium focus:border-primary/20 focus:bg-white focus:outline-none focus:ring-8 focus:ring-primary/5 transition-all"
                placeholder="admin@adventur.com"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contraseña segura</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-gray-50 bg-gray-50/50 py-4 pl-12 pr-4 text-sm font-medium focus:border-primary/20 focus:bg-white focus:outline-none focus:ring-8 focus:ring-primary/5 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={cn(
              "group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-primary py-5 text-sm font-black text-white shadow-xl shadow-primary/20 transition-all hover:bg-secondary active:scale-95 disabled:opacity-50",
            )}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Acceder al Panel
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
              </>
            )}
          </button>
        </form>

        <div className="bg-gray-50/50 p-6 text-center">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">© 2026 Adventur Security Layer</p>
        </div>
      </div>
    </div>
  );
}
