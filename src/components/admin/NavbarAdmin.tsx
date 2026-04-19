'use client';

import { Bell, Search, Settings, Command } from 'lucide-react';

export function NavbarAdmin() {
  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-zinc-200 bg-white px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar recursos... (Cmd + K)" 
            className="w-80 rounded-2xl border border-zinc-100 bg-zinc-50/50 py-2.5 pl-12 pr-4 text-sm font-medium focus:border-primary/20 focus:bg-white focus:outline-none focus:ring-8 focus:ring-primary/5 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-2 flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-[10px] font-black uppercase text-zinc-500">
          <Command className="h-3 w-3" />
          <span>Producción</span>
        </div>

        <button className="relative rounded-xl p-3 text-zinc-500 hover:bg-zinc-100 transition-all active:scale-95">
          <Bell className="h-5 w-5" />
          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500 border-[3px] border-white" />
        </button>

        <button className="rounded-xl p-3 text-zinc-500 hover:bg-zinc-100 transition-all active:scale-95">
          <Settings className="h-5 w-5" />
        </button>

        <div className="ml-4 h-10 w-[1px] bg-zinc-100" />

        <div className="ml-4 flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-xl border-2 border-primary/20 bg-zinc-100 p-0.5 shadow-inner">
            <div className="h-full w-full rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
