import { LogOut, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useState } from "react";

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Painel", href: "/" },
    { label: "Envio de exames", href: "/historico" },
    { label: "Envio de insumos", href: "/envio-unidades" },
  ];

  return (
    <>
      <header className="flex justify-between items-center w-full px-4 md:px-6 h-16 fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest border-b border-outline-variant print:hidden">
        <div className="flex items-center gap-xl">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="text-sm md:text-lg font-bold text-on-surface tracking-tight font-h3">
            Sistema Teste do Pezinho Cap5.3
          </div>
          
          <nav className="hidden md:flex h-full gap-lg ml-xl">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "font-semibold h-full flex items-center font-table-data text-table-data transition-colors duration-200 px-2 border-b-2",
                    isActive 
                      ? "text-primary border-primary" 
                      : "text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-container-high"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-md">
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 md:px-4 text-white hover:bg-white/10 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#001b3d]/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-[#001b3d] shadow-2xl flex flex-col border-r border-white/10">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div className="font-black text-white text-sm tracking-[0.2em] uppercase">Navegação</div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all border",
                      isActive 
                        ? "bg-white/10 text-white border-white/20 shadow-lg" 
                        : "text-white/60 border-transparent hover:text-white hover:bg-white/5"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10 bg-black/20">
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 font-bold text-sm hover:bg-red-400/10 rounded-2xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
