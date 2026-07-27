import { CalendarDays, Home, Scissors, Settings, Users, BellRing } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useDesktopReminders } from "../../hooks/useDesktopReminders";

const NAV_ITEMS = [
  { to: "/", label: "Inicio", icon: Home, end: true },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/recordatorios", label: "Recordatorios", icon: BellRing },
  { to: "/servicios", label: "Servicios", icon: Scissors },
  { to: "/ajustes", label: "Ajustes", icon: Settings },
];

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          isActive ? "bg-brass-500 text-ink-950" : "text-white/60 hover:text-white hover:bg-white/5"
        }`
      }
    >
      <Icon size={18} strokeWidth={2.25} />
      {label}
    </NavLink>
  );
}

function NavItemMobile({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-[11px] font-semibold transition-colors ${
          isActive ? "text-brass-400" : "text-white/50"
        }`
      }
    >
      <Icon size={20} strokeWidth={2.25} />
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const { settings, recallsVencidos, turnosDeManana } = useData();
  useDesktopReminders();
  const pendientes = recallsVencidos.length + turnosDeManana.filter((t) => !t.recordatorioEnviadoEl).length;

  return (
    <div className="min-h-screen bg-ink-950 text-white flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 p-5 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-8 px-1">
          <div className="p-2 rounded-xl bg-brass-500 text-ink-950">
            <Scissors size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display text-2xl leading-none tracking-wide text-white">{settings.nombreNegocio}</p>
            <p className="text-[11px] text-white/40 uppercase tracking-widest">Turnos App</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <div key={item.to} className="relative">
              <NavItem {...item} />
              {item.to === "/recordatorios" && pendientes > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {pendientes}
                </span>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-auto text-[11px] text-white/30 px-1">
          Tus datos se guardan solo en este dispositivo.
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <div className="p-1.5 rounded-lg bg-brass-500 text-ink-950">
            <Scissors size={18} strokeWidth={2.5} />
          </div>
          <p className="font-display text-xl tracking-wide">{settings.nombreNegocio}</p>
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ink-900/95 backdrop-blur border-t border-white/10 grid grid-cols-6 px-1 z-40">
          {NAV_ITEMS.map((item) => (
            <div key={item.to} className="relative">
              <NavItemMobile {...item} />
              {item.to === "/recordatorios" && pendientes > 0 && (
                <span className="absolute right-2 top-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center">
                  {pendientes}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
