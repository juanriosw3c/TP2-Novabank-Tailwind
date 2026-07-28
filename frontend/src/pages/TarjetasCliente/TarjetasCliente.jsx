import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut, ShieldCheck, User } from "lucide-react";

import CardSummary from "../../components/Dashboard/CardSummary";
import logo from "../../assets/logo.png";
import { useBank } from "../../context/BankContext";
import ProfileModal from "../../components/Dashboard/ProfileModal";

function TarjetasCliente() {
  const { currentUser, updateClientCards, logout, requestCard } = useBank();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  const client = currentUser || {
    id: "cliente-1",
    name: "Federico García",
    password: "cliente123",
    initials: "FG",
    cards: []
  };

  const cards = client.cards || [];

  const setCards = (newCards) => {
    // Si se pasa una función updater (como setCards(prev => ...))
    const resolvedCards = typeof newCards === "function" ? newCards(cards) : newCards;
    updateClientCards(client.id, resolvedCards);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-[#070713] text-slate-50 pb-8">
      {/* Header de la página */}
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-white/5 bg-[#070713]">
        <Link to="/cliente" className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center border border-white/10 bg-white/5 text-[#d8d6e8] transition-colors hover:bg-white/10 hover:text-white" aria-label="Volver al dashboard">
          <ChevronLeft size={20} />
        </Link>

        <img src={logo} alt="NovaBank" className="h-7 w-auto" />

        {/* Dropdown de Perfil */}
        <div className="relative">
          <button
            className="w-[44px] h-[44px] rounded-full bg-linear-to-br from-purple-500 to-violet-600 font-extrabold text-sm text-slate-50 cursor-pointer shadow-[0_8px_24px_rgba(124,58,237,0.3)] hover:opacity-90 active:scale-95 transition-all"
            type="button"
            aria-label="Perfil"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {client.initials}
          </button>

          {showProfileMenu && (
            <div className="absolute top-[120%] right-0 bg-[#1e1b2e] border border-[#3b2d54] rounded-lg p-2 min-w-[160px] flex flex-col gap-1 z-100 shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              <button 
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setShowProfileMenu(false);
                }}
                className="bg-transparent border-none text-slate-100 py-2 px-3 text-left flex items-center gap-2 cursor-pointer rounded-md w-full text-sm transition-colors hover:bg-[#2d264d]"
              >
                <User size={16} /> Mi perfil
              </button>
              
              <hr className="border-0 border-t border-[#3b2d54] my-1" />
              
              <button 
                type="button" 
                className="bg-transparent border-none py-2 px-3 text-left flex items-center gap-2 cursor-pointer rounded-md w-full text-sm transition-colors text-rose-500 hover:bg-rose-500/10" 
                onClick={handleLogout}
              >
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Cuerpo principal */}
      <section className="w-full max-w-[980px] mx-auto px-4 md:px-8 pt-10">
        <div className="mb-6">
          <h1 className="m-0 text-3xl sm:text-4xl font-bold leading-tight">Tarjetas</h1>
        </div>

        <CardSummary
          cards={cards}
          setCards={setCards}
          clientPassword={client.password}
          cardHolder={client.name}
          requestCard={requestCard}
        />
      </section>

      {/* Footer de seguridad */}
      <footer className="flex items-center justify-center gap-2 text-[#4c466c] text-sm mt-8 px-4 text-center">
        <ShieldCheck size={15} />
        Tu seguridad es nuestra prioridad. Cifrado de extremo a extremo.
      </footer>

      {/* Modal de perfil */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </main>
  );
}

export default TarjetasCliente;

