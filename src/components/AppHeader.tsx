import {
  Menu,
  Search,
  User,
  LogIn,
  Crown,
  Shield,
  LogOut,
  CreditCard,
  UserPlus,
  BookOpen,
  Heart,
  Newspaper,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { User as IUser } from "@/types/api";

const BRAND = "#2B58C5";
const CHIP_BG = "#F0F2F6";

type HeaderSearchBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
};

export function HeaderSearchBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Pesquisar...",
  className,
}: HeaderSearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <Input
        type="text"
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9 h-9 lg:h-10 rounded-full border-0 text-sm text-gray-800 placeholder:text-gray-400 shadow-none focus-visible:ring-2 focus-visible:ring-[#2B58C5]/25"
        style={{ backgroundColor: CHIP_BG }}
      />
    </div>
  );
}

type AppHeaderProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  currentUser?: IUser | null;
  hasActivePlan?: boolean;
  activePlanLabel?: string | null;
  loading?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
  onSubscribe?: () => void;
  logoutLoading?: boolean;
  subtitle?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
};

const desktopNav = [
  { to: "/", label: "Notícias", icon: Newspaper, end: true },
  { to: "/jornais", label: "Jornais", icon: BookOpen },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
];

export function AppHeader({
  searchQuery,
  onSearchChange,
  currentUser = null,
  hasActivePlan = false,
  activePlanLabel,
  onLogin,
  onSignup,
  onLogout,
  onSubscribe,
  logoutLoading,
  subtitle = "Notícias e Jornais",
  searchPlaceholder = "Pesquisar...",
  showSearch = true,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeAnd = (fn?: () => void) => () => {
    setMenuOpen(false);
    fn?.();
  };

  const handleLogin = () => {
    if (onLogin) onLogin();
    else navigate("/jornais");
  };

  const handleSignup = () => {
    if (onSignup) onSignup();
    else navigate("/jornais");
  };

  const handleSubscribe = () => {
    if (onSubscribe) onSubscribe();
    else navigate("/plans");
  };

  const planBadge = hasActivePlan ? (
    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">
      <Crown className="w-3 h-3 mr-1" />
      Plano activo{activePlanLabel ? ` · ${activePlanLabel}` : ""}
    </Badge>
  ) : currentUser && currentUser.tipo_usuario !== "admin" ? (
    <Badge
      variant="secondary"
      className="cursor-pointer bg-gray-100 text-gray-600"
      onClick={handleSubscribe}
    >
      Sem plano
    </Badge>
  ) : null;

  const mobileNavLinks = (
    <>
      {desktopNav.map(({ to, label, icon: Icon, end }) => (
        <Button
          key={to}
          variant="ghost"
          className="w-full justify-start text-gray-700"
          onClick={closeAnd(() => navigate(to))}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Button>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        {/* Barra principal: logo + search + menu */}
        <div className="flex items-center gap-2 sm:gap-3 h-14 lg:h-16">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="shrink-0 text-left"
          >
            <h1
              className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight leading-none"
              style={{ color: BRAND }}
            >
              O DESTAQUE
            </h1>
            <p className="hidden sm:block text-[11px] lg:text-xs text-gray-400 mt-0.5">
              {subtitle}
            </p>
          </button>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-4">
            {desktopNav.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "text-white" : "text-gray-600 hover:bg-gray-50"
                  )
                }
                style={({ isActive }) =>
                  isActive ? { backgroundColor: BRAND } : undefined
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1 min-w-0 lg:hidden" aria-hidden />

          {/* Search no header — apenas desktop */}
          {showSearch && (
            <div className="hidden lg:block flex-1 min-w-0 max-w-md ml-auto">
              <HeaderSearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                searchPlaceholder={searchPlaceholder}
              />
            </div>
          )}

          {/* Auth desktop */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {currentUser ? (
              <>
                {planBadge}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700"
                  onClick={() => navigate("/profile")}
                >
                  <User className="w-4 h-4 mr-1.5" />
                  {currentUser.nome?.split(" ")[0] || "Perfil"}
                </Button>
                {currentUser.tipo_usuario === "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/admin")}
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                )}
                {currentUser.tipo_usuario !== "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#2B58C5]/30 text-[#2B58C5]"
                    onClick={handleSubscribe}
                  >
                    <CreditCard className="w-4 h-4 mr-1.5" />
                    {hasActivePlan ? "Planos" : "Subscrever"}
                  </Button>
                )}
                {onLogout && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-600"
                    onClick={onLogout}
                    disabled={logoutLoading}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700"
                  onClick={handleLogin}
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Entrar
                </Button>
                <Button
                  size="sm"
                  className="text-white"
                  style={{ backgroundColor: BRAND }}
                  onClick={handleSignup}
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Criar conta
                </Button>
              </>
            )}
          </div>

          {/* Menu mobile */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="lg:hidden p-2 -mr-1 text-gray-800 shrink-0"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6" strokeWidth={2} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white">
              <SheetHeader>
                <SheetTitle className="text-gray-900">Menu</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-2">
                {currentUser ? (
                  <>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 mb-4">
                      <p className="text-sm font-medium truncate text-gray-900">
                        {currentUser.nome || currentUser.email}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                      {planBadge && <div className="mt-2">{planBadge}</div>}
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700"
                      onClick={closeAnd(() => navigate("/profile"))}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Meu perfil
                    </Button>
                    {mobileNavLinks}
                    {currentUser.tipo_usuario !== "admin" && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700"
                        onClick={closeAnd(handleSubscribe)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {hasActivePlan ? "Ver planos" : "Subscrever"}
                      </Button>
                    )}
                    {currentUser.tipo_usuario === "admin" && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700"
                        onClick={closeAnd(() => navigate("/admin"))}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    )}
                    {onLogout && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-600"
                        onClick={closeAnd(onLogout)}
                        disabled={logoutLoading}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full justify-center text-white h-11"
                      style={{ backgroundColor: BRAND }}
                      onClick={closeAnd(handleLogin)}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Entrar
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-center h-11 border-[#2B58C5]/40 text-[#2B58C5]"
                      onClick={closeAnd(handleSignup)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Criar conta
                    </Button>
                    <div className="pt-2 space-y-1 border-t border-gray-100 mt-2">
                      {mobileNavLinks}
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
