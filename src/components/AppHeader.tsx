import { Menu, Search, User, LogIn, Crown, Shield, LogOut, CreditCard, UserPlus, BookOpen, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import type { User as IUser } from "@/types/api";

const BRAND = "#2B58C5";
const CHIP_BG = "#F0F2F6";

type AppHeaderProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  currentUser: IUser | null;
  hasActivePlan: boolean;
  activePlanLabel?: string | null;
  loading?: boolean;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  onSubscribe?: () => void;
  logoutLoading?: boolean;
  subtitle?: string;
  searchPlaceholder?: string;
};

export function AppHeader({
  searchQuery,
  onSearchChange,
  currentUser,
  hasActivePlan,
  activePlanLabel,
  onLogin,
  onSignup,
  onLogout,
  onSubscribe,
  logoutLoading,
  subtitle = "Notícias e Jornais",
  searchPlaceholder = "Pesquisar jornais...",
}: AppHeaderProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeAnd = (fn?: () => void) => () => {
    setMenuOpen(false);
    fn?.();
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
      onClick={closeAnd(onSubscribe)}
    >
      Sem plano
    </Badge>
  ) : null;

  const navLinks = (
    <>
      <Button
        variant="ghost"
        className="w-full justify-start text-gray-700"
        onClick={closeAnd(() => navigate("/"))}
      >
        <Search className="w-4 h-4 mr-2" />
        Notícias
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start text-gray-700"
        onClick={closeAnd(() => navigate("/jornais"))}
      >
        <BookOpen className="w-4 h-4 mr-2" />
        Jornais Digitais
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start text-gray-700"
        onClick={closeAnd(() => navigate("/favoritos"))}
      >
        <Heart className="w-4 h-4 mr-2" />
        Favoritos
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-white px-4 pt-5 pb-3">
      <div className="flex items-start justify-between mb-4">
        <button type="button" onClick={() => navigate("/")} className="text-left">
          <h1
            className="text-[26px] font-extrabold tracking-tight leading-none"
            style={{ color: BRAND }}
          >
            O DESTAQUE
          </h1>
          <p className="text-[13px] text-gray-400 mt-1">{subtitle}</p>
        </button>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button type="button" className="p-2 -mr-1 text-gray-800" aria-label="Menu">
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
                  {navLinks}
                  {currentUser.tipo_usuario !== "admin" && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700"
                      onClick={closeAnd(onSubscribe)}
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
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-600"
                    onClick={closeAnd(onLogout)}
                    disabled={logoutLoading}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full justify-center text-white h-11"
                    style={{ backgroundColor: BRAND }}
                    onClick={closeAnd(onLogin)}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center h-11 border-[#2B58C5]/40 text-[#2B58C5]"
                    onClick={closeAnd(onSignup)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar conta
                  </Button>

                  <div className="pt-2 space-y-1 border-t border-gray-100 mt-2">
                    {navLinks}
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 h-[46px] rounded-full border-0 text-[14px] text-gray-800 placeholder:text-gray-400 shadow-none focus-visible:ring-2 focus-visible:ring-[#2B58C5]/25"
          style={{ backgroundColor: CHIP_BG }}
        />
      </div>
    </header>
  );
}
