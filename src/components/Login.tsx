import { useState } from "react";
import { Lock, User, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Mock auth delay
    setTimeout(() => {
      if (email === "daps.cap53@gmail.com" && password === "daps2022") {
        localStorage.setItem("isAuthenticated", "true");
        onLogin();
      } else {
        setError("Usuário ou senha incorretos.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-[#001b3d] z-[100] overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-64 -mt-64 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full -ml-64 -mb-64 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[420px] px-6 relative z-10">
        <div className="bg-[#002b5c] border border-white/20 rounded-[32px] shadow-2xl overflow-hidden flex flex-col w-full">
          <div className="p-8 md:p-10 flex flex-col w-full">
            {/* Header Section */}
            <div className="flex flex-col items-center mb-10">
              <h2 className="text-2xl font-black text-white text-center uppercase tracking-tight leading-tight">
                Sistema Teste do Pezinho
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="h-[1px] w-6 bg-white/30"></span>
                <p className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-bold">CAP 5.3 / DAPS</p>
                <span className="h-[1px] w-6 bg-white/30"></span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-white/70 uppercase tracking-widest ml-1">
                  USUÁRIO
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail de acesso"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-white/70 uppercase tracking-widest ml-1">
                  SENHA
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm font-bold bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-[#001b3d] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl shadow-black/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-[#001b3d]/20 border-t-[#001b3d] rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Entrar no Sistema"
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-white/5 py-4 text-center border-t border-white/10">
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
              Acesso restrito a servidores autorizados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
