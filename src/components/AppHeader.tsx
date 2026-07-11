import {
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
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { formatSubscriptionType, useUserAccount } from "@/hooks/useUserAccount";

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
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
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
  searchQuery = "",
  onSearchChange = () => {},
  subtitle = "Notícias e Jornais",
  searchPlaceholder = "Pesquisar...",
  showSearch = true,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { openLogin, openSignup } = useAuthModal();
  const { hasActivePlan, activeSubscription } = useUserAccount(Boolean(user) && user?.tipo_usuario !== "admin");
  const [accountOpen, setAccountOpen] = useState(false);

  const activePlanLabel = activeSubscription
    ? formatSubscriptionType(activeSubscription.subscription_type)
    : user?.tipo_subscricao
      ? formatSubscriptionType(user.tipo_subscricao)
      : null;

  const planBadge = hasActivePlan ? (
    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 text-xs">
      <Crown className="w-3 h-3 mr-1" />
      Plano activo{activePlanLabel ? ` · ${activePlanLabel}` : ""}
    </Badge>
  ) : user && user.tipo_usuario !== "admin" ? (
    <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
      Sem plano
    </Badge>
  ) : null;

  const userInitial = (user?.nome || user?.email || "U").charAt(0).toUpperCase();

  const closeAnd = (fn: () => void) => () => {
    setAccountOpen(false);
    fn();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-2 sm:gap-3 h-14 lg:h-16">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="shrink-0 text-left min-w-0"
          >
            <h1
              className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight leading-none"
              style={{ color: BRAND }}
            >
              O DESTAQUE
            </h1>
            <p className="hidden sm:block text-[11px] lg:text-xs text-gray-400 mt-0.5 truncate">
              {subtitle}
            </p>
          </button>

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

          <div className="flex-1 min-w-0" aria-hidden />

          {showSearch && (
            <div className="hidden lg:block w-full max-w-md">
              <HeaderSearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                searchPlaceholder={searchPlaceholder}
              />
            </div>
          )}

          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-2 shrink-0 ml-3">
            {user ? (
              <>
                {planBadge}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700"
                  onClick={() => navigate("/profile")}
                >
                  <User className="w-4 h-4 mr-1.5" />
                  {user.nome?.split(" ")[0] || "Perfil"}
                </Button>
                {user.tipo_usuario === "admin" && (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                    <Shield className="w-4 h-4" />
                  </Button>
                )}
                {user.tipo_usuario !== "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#2B58C5]/30 text-[#2B58C5]"
                    onClick={() => navigate("/plans")}
                  >
                    <CreditCard className="w-4 h-4 mr-1.5" />
                    {hasActivePlan ? "Planos" : "Subscrever"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-600"
                  onClick={() => logout()}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-gray-700" onClick={openLogin}>
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Entrar
                </Button>
                <Button size="sm" className="text-white" style={{ backgroundColor: BRAND }} onClick={openSignup}>
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Criar conta
                </Button>
              </>
            )}
          </div>

          {/* Mobile: conta compacta (sem duplicar bottom nav) */}
          <div className="lg:hidden shrink-0">
            {user ? (
              <button
                type="button"
                onClick={() => setAccountOpen(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{ backgroundColor: BRAND }}
                aria-label="Conta"
              >
                {userInitial}
              </button>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="text-sm font-medium px-2 py-1.5 rounded-lg"
                style={{ color: BRAND }}
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>

      <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-2 lg:hidden">
          <SheetHeader className="text-left pb-2">
            <SheetTitle className="text-gray-900">Minha conta</SheetTitle>
          </SheetHeader>

          {user && (
            <div className="space-y-1">
              <div className="rounded-xl bg-gray-50 p-3 mb-3">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.nome || "Utilizador"}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                {planBadge && <div className="mt-2">{planBadge}</div>}
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start h-11 text-gray-700"
                onClick={closeAnd(() => navigate("/profile"))}
              >
                <User className="w-4 h-4 mr-3" />
                Ver perfil
              </Button>

              {user.tipo_usuario !== "admin" && (
                <Button
                  variant="ghost"
                  className="w-full justify-start h-11 text-gray-700"
                  onClick={closeAnd(() => navigate("/plans"))}
                >
                  <CreditCard className="w-4 h-4 mr-3" />
                  {hasActivePlan ? "Ver planos" : "Subscrever"}
                </Button>
              )}

              {user.tipo_usuario === "admin" && (
                <Button
                  variant="ghost"
                  className="w-full justify-start h-11 text-gray-700"
                  onClick={closeAnd(() => navigate("/admin"))}
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Administração
                </Button>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start h-11 text-red-600 hover:text-red-600"
                onClick={closeAnd(() => logout())}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sair
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </header>
  );
}
