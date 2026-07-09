import { NavLink, useLocation } from "react-router-dom";
import { Newspaper, Library, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND = "#2B58C5";

const tabs = [
  { to: "/", label: "Notícias", icon: Newspaper, end: true },
  { to: "/jornais", label: "Jornais", icon: Library },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/profile", label: "Minha Conta", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const hideOnPaths = ["/jornal/", "/admin", "/noticia/"];
  const hidden = hideOnPaths.some((p) => location.pathname.includes(p));
  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-stretch justify-around h-[62px] max-w-lg mx-auto px-2 lg:max-w-none">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0"
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="w-[22px] h-[22px]"
                  style={{ color: isActive ? BRAND : "#9CA3AF" }}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className={cn(
                    "text-[10px] leading-tight truncate max-w-full",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                  style={{ color: isActive ? BRAND : "#9CA3AF" }}
                >
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
