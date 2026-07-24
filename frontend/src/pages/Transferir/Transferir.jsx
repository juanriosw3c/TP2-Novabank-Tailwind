import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MoreVertical,
  Search,
  Send,
  Star,
} from "lucide-react";

import DashboardNavbar from "../../components/Dashboard/DashboardNavbar";
import Sidebar from "../../components/Dashboard/Sidebar";
import TransferModal from "../../components/Dashboard/TransferModal";
import { useBank } from "../../context/BankContext";

function Transferir() {
  const navigate = useNavigate();
  const {
    currentUser,
    toggleFavoriteContact,
    updateContactReference,
    removeContact,
  } = useBank();

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [activeTab, setActiveTab] = useState("contacts");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const client = currentUser || {
    initials: "FG",
    contacts: [],
  };

  // Filtrar contactos por búsqueda y pestaña de favoritos
  const filteredContacts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const contactsList = client.contacts || [];

    return contactsList.filter((contact) => {
      if (activeTab === "favorites" && !contact.isFavorite) return false;
      if (!normalized) return true;

      return [contact.name, contact.alias, contact.cbu, contact.reference]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [activeTab, client.contacts, search]);

  const openNewTransfer = () => {
    setSelectedContact(null);
    setModalOpen(true);
  };

  const startContactTransfer = (contact) => {
    setSelectedContact(contact);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedContact(null);
  };

  const handleReferenceEdit = async (contact) => {
    const nextReference = window.prompt("Nueva referencia o apodo", contact.reference || contact.name);

    if (nextReference && nextReference.trim()) {
      await updateContactReference(contact.id, nextReference.trim());
    }
  };

  const handleDelete = async (contact) => {
    const shouldDelete = window.confirm(`¿Eliminar a ${contact.reference || contact.name} de tus contactos?`);

    if (shouldDelete) {
      await removeContact(contact.id);
    }
  };

  return (
    <main className={`min-h-screen bg-[#070713] text-slate-50 pb-8 pt-23 transition-all duration-300 ${isSidebarOpen ? "md:pl-65" : "md:pl-0"}`}>
      <DashboardNavbar
        userInitials={client.initials}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAdmin={false} />

      <div className="w-full max-w-295 mx-auto px-4 md:px-8 pt-10">
        {/* Volver */}
        <button
          type="button"
          className="flex items-center gap-2 text-violet-400 hover:text-violet-300 font-semibold cursor-pointer mb-6"
          onClick={() => navigate("/cliente")}
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <section className="border border-violet-500/20 rounded-3xl bg-[#111128] p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Transferir</h1>
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-linear-to-br from-violet-600 to-purple-500 hover:brightness-110 text-white font-bold px-5 py-3 rounded-xl transition-all cursor-pointer text-sm"
              onClick={openNewTransfer}
            >
              <Send size={18} />
              Transferir a una nueva cuenta
            </button>
          </div>

          {/* Solapas / Tabs */}
          <div className="flex gap-2 border-b border-slate-400/10 pb-4" role="tablist">
            <button
              type="button"
              className={`py-2 px-4 rounded-lg font-bold text-sm cursor-pointer transition-colors ${
                activeTab === "contacts" ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("contacts")}
            >
              Contactos
            </button>
            <button
              type="button"
              className={`flex items-center gap-1.5 py-2 px-4 rounded-lg font-bold text-sm cursor-pointer transition-colors ${
                activeTab === "favorites" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("favorites")}
            >
              <Star size={16} />
              Favoritos
            </button>
          </div>

          {/* Búsqueda */}
          <label className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 gap-3">
            <Search size={18} className="shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-transparent border-none text-white w-full focus:outline-none placeholder-gray-500 text-sm"
              placeholder="Buscar por nombre, alias, CBU/CVU o referencia"
            />
          </label>

          {/* Lista de Contactos */}
          <div className="flex flex-col gap-3">
            {filteredContacts.length === 0 ? (
              <div className="text-center text-slate-500 py-8 text-sm">No hay contactos para mostrar.</div>
            ) : (
              filteredContacts.map((contact) => (
                <article
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 cursor-pointer transition-all hover:pl-5"
                  key={contact.id}
                  onClick={() => startContactTransfer(contact)}
                >
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-100 truncate">{contact.reference || contact.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{contact.name}</p>
                    <span className="block text-xs text-slate-500 mt-1 truncate">{contact.alias}</span>
                    <small className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider block mt-1">{contact.bank}</small>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botón Favorito */}
                    <button
                      type="button"
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        contact.isFavorite ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
                      }`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavoriteContact(contact.id);
                      }}
                      aria-label="Marcar favorito"
                    >
                      <Star size={21} fill={contact.isFavorite ? "currentColor" : "none"} />
                    </button>

                    {/* Menú Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-white cursor-pointer rounded-lg"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuOpen(menuOpen === contact.id ? null : contact.id);
                        }}
                        aria-label="Opciones"
                      >
                        <MoreVertical size={22} />
                      </button>

                      {menuOpen === contact.id && (
                        <div className="absolute right-0 top-[110%] w-45 bg-[#1e1b2e] border border-[#3b2d54] rounded-lg p-1 z-50 shadow-xl" onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            className="w-full text-left py-2 px-3 text-xs text-slate-100 hover:bg-[#2d264d] rounded cursor-pointer"
                            onClick={() => {
                              handleReferenceEdit(contact);
                              setMenuOpen(null);
                            }}
                          >
                            Modificar referencia
                          </button>
                          <button
                            type="button"
                            className="w-full text-left py-2 px-3 text-xs text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                            onClick={() => {
                              handleDelete(contact);
                              setMenuOpen(null);
                            }}
                          >
                            Eliminar contacto
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Modal Modular de transferencia */}
      <TransferModal isOpen={modalOpen} onClose={closeModal} recipient={selectedContact} />
    </main>
  );
}

export default Transferir;
