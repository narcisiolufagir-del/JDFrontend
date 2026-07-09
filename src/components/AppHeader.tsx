import { Menu, Search, User, LogIn, Crown, Shield, LogOut, CreditCard } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User as IUser } from "@/types/api";
import { formatSubscriptionType } from "@/hooks/useUserAccount";

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
};

export function AppHeader({
  searchQuery,
  onSearchChange,
  currentUser,
  hasActivePlan,
  activePlanLabel,
  loading,
  onLogin,
  onSignup,
  onLogout,
  onSubscribe,
  logoutLoading,
}: AppHeaderProps) {
  const navigate = useNavigate();

  const planBadge = hasActivePlan ? (
    <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 border-emerald-500/20">
      <Crown className="w-3 h-3 mr-1" />
      Plano activo{activePlanLabel ? ` · ${activePlanLabel}` : ""}
    </Badge>
  ) : currentUser && currentUser.tipo_usuario !== "admin" ? (
    <Badge variant="secondary" className="cursor-pointer" onClick={onSubscribe}>
      Sem plano
    </Badge>
  ) : null;

  const menuItems = currentUser ? (
    <>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/profile")}
      >
        <User className="w-4 h-4 mr-2" />
        Meu perfil
      </Button>
      {currentUser.tipo_usuario !== "admin" && (
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onSubscribe}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {hasActivePlan ? "Ver planos" : "Subscrever"}
        </Button>
      )}
      {currentUser.tipo_usuario === "admin" && (
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => navigate("/admin")}
        >
          <Shield className="w-4 h-4 mr-2" />
          Admin
        </Button>
      )}
      <Button
        variant="ghost"
        className="w-full justify-start text-destructive hover:text-destructive"
        onClick={onLogout}
        disabled={logoutLoading}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sair
      </Button>
    </>
  ) : (
    <>
      <Button variant="ghost" className="w-full justify-start" onClick={onLogin}>
        <LogIn className="w-4 h-4 mr-2" />
        Entrar
      </Button>
      <Button className="w-full justify-start" onClick={onSignup}>
        <User className="w-4 h-4 mr-2" />
        Criar conta
      </Button>
    </>
  );

  return (
    <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-card/30">
      <div className="container mx-auto px-4 py-3 space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 min-w-0 shrink"
          >
            <img
              src="https://odestaque.co.mz/wp-content/uploads/2025/02/cropped-DESTAQUE-globo-SEM-FUNDO-180x180.png"
              alt="Jornal Destaque"
              className="w-8 h-8 object-contain shrink-0"
            />
            <span className="text-lg sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent truncate">
              Jornal Destaque
            </span>
          </button>

          <div className="ml-auto hidden md:flex items-center gap-2">
            {planBadge}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 max-w-[180px]">
                    <User className="w-4 h-4 shrink-0" />
                    <span className="truncate">{currentUser.nome || currentUser.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="truncate">
                    {currentUser.nome || currentUser.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Meu perfil
                  </DropdownMenuItem>
                  {currentUser.tipo_usuario !== "admin" && (
                    <DropdownMenuItem onClick={onSubscribe}>
                      {hasActivePlan ? "Ver planos" : "Subscrever"}
                    </DropdownMenuItem>
                  )}
                  {currentUser.tipo_usuario === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onLogout}
                    disabled={logoutLoading}
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={onLogin}>
                  Entrar
                </Button>
                <Button size="sm" onClick={onSignup}>
                  Cadastrar
                </Button>
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden shrink-0">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {currentUser && (
                  <div className="rounded-lg border border-border/60 bg-muted/40 p-3 mb-4">
                    <p className="text-sm font-medium truncate">
                      {currentUser.nome || currentUser.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                    <div className="mt-2">{planBadge}</div>
                  </div>
                )}
                {menuItems}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar jornais..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-card/50 border-border/50 backdrop-blur-sm"
          />
        </div>

        {loading ? null : (
          <div className="md:hidden flex items-center justify-between gap-2">
            {planBadge}
            {!currentUser && (
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={onLogin}>
                  Entrar
                </Button>
                <Button size="sm" onClick={onSignup}>
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
