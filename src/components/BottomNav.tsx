import { NavLink, useLocation } from "react-router-dom";
import { Newspaper, BookOpen, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Notícias", icon: Newspaper, end: true },
  { to: "/jornais", label: "Jornais", icon: BookOpen },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/profile", label: "Minha Conta", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const hideOnPaths = ["/jornal/", "/admin", "/noticia/"];
  const hidden = hideOnPaths.some((p) => location.pathname.includes(p));
  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                isActive ? "text-[#1a56db]" : "text-gray-400"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
