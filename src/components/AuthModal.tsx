import { useState } from "react";
import { LogIn, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";

const BRAND = "#2B58C5";

export function AuthModal() {
  const { isOpen, mode, close, setMode } = useAuthModal();
  const { login, register } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setSenha("");
    setConfirmSenha("");
    setNome("");
    setTelefone("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    close();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (mode === "signup") {
        if (senha !== confirmSenha) {
          setError("As senhas não coincidem.");
          return;
        }
        await register({ nome, telefone, email, senha });
      } else {
        await login({ email, senha });
      }

      handleClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(
        err?.response?.data?.detail ||
          (mode === "login"
            ? "Falha ao entrar. Verifique as suas credenciais."
            : "Falha ao criar conta. Tente novamente.")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-50 transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{ backgroundColor: BRAND }}
            >
              {mode === "login" ? (
                <LogIn className="w-7 h-7 text-white" />
              ) : (
                <User className="w-7 h-7 text-white" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {mode === "login"
                ? "Entre para aceder aos jornais digitais"
                : "Registe-se para começar a ler"}
            </p>
          </div>

          <div className="space-y-3">
            {mode === "signup" && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Nome</label>
                  <Input
                    type="text"
                    placeholder="O seu nome"
                    className="bg-[#F0F2F6] border-0"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Telefone</label>
                  <Input
                    type="tel"
                    placeholder="84 000 0000"
                    className="bg-[#F0F2F6] border-0"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block text-gray-700">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                className="bg-[#F0F2F6] border-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-gray-700">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-[#F0F2F6] border-0"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            {mode === "signup" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block text-gray-700">Confirmar senha</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-[#F0F2F6] border-0"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                />
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              className="w-full text-white h-11"
              style={{ backgroundColor: BRAND }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "A processar..." : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
            <p className="text-center text-sm text-gray-500 pt-1">
              {mode === "login" ? (
                <>
                  Não tem conta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode("signup");
                    }}
                    className="font-medium hover:underline"
                    style={{ color: BRAND }}
                  >
                    Registe-se
                  </button>
                </>
              ) : (
                <>
                  Já tem conta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode("login");
                    }}
                    className="font-medium hover:underline"
                    style={{ color: BRAND }}
                  >
                    Entrar
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
