import { useState } from "react";
import {
  CreditCard,
  Eye,
  EyeOff,
  Snowflake,
  TriangleAlert,
} from "lucide-react";

function CardSummary({ cards, onCreateCard, onFreezeCard, onDeleteCard, onVerifyPassword }) {
  const [visibleNumbers, setVisibleNumbers] = useState({});
  const [visibleCvvs, setVisibleCvvs] = useState({});
  const [cvvPassword, setCvvPassword] = useState("");
  const [freezePassword, setFreezePassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newCardType, setNewCardType] = useState("debito");

  const formatNumber = (number) => number.replace(/(.{4})/g, "$1 ").trim();

  const toggleNumber = (cardId) => {
    setVisibleNumbers((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const openCVV = (cardId) => {
    setSelectedCard(cardId);
    setCvvPassword("");
    setShowPasswordModal(true);
  };

  const hideCVV = (cardId) => {
    setVisibleCvvs((prev) => ({
      ...prev,
      [cardId]: false,
    }));
  };

  const handleVerifyCvvPassword = async () => {
    const valida = await onVerifyPassword(cvvPassword);

    if (valida) {
      setVisibleCvvs((prev) => ({
        ...prev,
        [selectedCard]: true,
      }));

      setShowPasswordModal(false);
      setCvvPassword("");
    } else {
      alert("Contraseña incorrecta.");
    }
  };

  const openFreezeConfirmation = (cardId) => {
    setSelectedCard(cardId);
    setFreezePassword("");
    setShowFreezeModal(true);
  };

  const confirmFreeze = async () => {
    const valida = await onVerifyPassword(freezePassword);

    if (!valida) {
      alert("Contraseña incorrecta.");
      return;
    }

    const result = await onFreezeCard(selectedCard);

    if (!result.success) {
      alert(result.error || "No se pudo actualizar la tarjeta.");
      return;
    }

    setShowFreezeModal(false);
    setFreezePassword("");
  };

  const openDeleteConfirmation = (cardId) => {
    setSelectedCard(cardId);
    setDeletePassword("");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const valida = await onVerifyPassword(deletePassword);

    if (!valida) {
      alert("Contraseña incorrecta.");
      return;
    }

    const result = await onDeleteCard(selectedCard);

    if (!result.success) {
      alert(result.error || "No se pudo eliminar la tarjeta.");
      return;
    }

    setVisibleNumbers((prev) => ({
      ...prev,
      [selectedCard]: false,
    }));
    setVisibleCvvs((prev) => ({
      ...prev,
      [selectedCard]: false,
    }));
    setShowDeleteModal(false);
    setDeletePassword("");
  };

  const requestNewCard = async () => {
    const result = await onCreateCard(newCardType);

    if (!result.success) {
      alert(result.error || "No se pudo crear la tarjeta.");
      return;
    }

    setVisibleNumbers({});
    setVisibleCvvs({});
    setShowRequestModal(false);
    setNewCardType("debito");
  };

  const selectedFreezeCard = cards.find((card) => card.id === selectedCard);
  const selectedDeleteCard = cards.find((card) => card.id === selectedCard);

  return (
    <section className="border border-violet-500/20 rounded-3xl bg-[#111128] p-5 sm:p-8 flex flex-col gap-6">
      
      {/* Lista de Tarjetas */}
      <div className="flex flex-col gap-4.5">
        {cards.map((card) => {
          const hiddenNumber = `**** **** **** ${card.number.slice(-4)}`;

          return (
            <div key={card.id} className="flex flex-col md:flex-row items-stretch md:items-center gap-5">
              
              {/* Tarjeta de Crédito/Débito Visual */}
              <div
                className={`relative flex-1 min-h-44.5 flex flex-col justify-between border border-purple-500/40 rounded-[22px] bg-[radial-gradient(circle_at_88%_92%,rgba(168,85,247,0.26),transparent_32%)] bg-linear-to-br from-[#4c0d87] to-[#281160] text-white p-7 sm:p-[1.9rem] shadow-[inset_0_0_28px_rgba(168,85,247,0.2)] transition-transform duration-200 hover:-translate-y-0.5 ${
                  card.frozen ? "opacity-60 grayscale" : ""
                }`}
              >
                <p className="m-0 uppercase tracking-wider text-violet-300 text-xs sm:text-sm font-semibold">{card.type}</p>

                {/* Número de Tarjeta */}
                <div className="flex justify-between items-center gap-4">
                  <strong className="text-xl sm:text-2xl tracking-[0.12em] font-bold font-mono">
                    {visibleNumbers[card.id]
                      ? formatNumber(card.number)
                      : hiddenNumber}
                  </strong>

                  <button
                    className="border-none bg-transparent text-white cursor-pointer flex items-center transition-transform duration-200 hover:scale-110"
                    onClick={() => toggleNumber(card.id)}
                    type="button"
                    aria-label="Ver u ocultar número de tarjeta"
                  >
                    {visibleNumbers[card.id]
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}
                  </button>
                </div>

                {/* Pie de la tarjeta: Vence y CVV */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-violet-300 text-xs sm:text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-100">{card.holder}</span>
                    <span>Vence {card.expires}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-white font-semibold">
                    <span>CVV: {visibleCvvs[card.id] ? card.cvv : "***"}</span>

                    <button
                      className="border-none bg-transparent text-white cursor-pointer flex items-center transition-transform duration-200 hover:scale-110"
                      onClick={() => {
                        if (visibleCvvs[card.id]) {
                          hideCVV(card.id);
                        } else {
                          openCVV(card.id);
                        }
                      }}
                      type="button"
                      aria-label="Ver u ocultar CVV"
                    >
                      {visibleCvvs[card.id]
                        ? <EyeOff size={18} />
                        : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Sello de Tarjeta Congelada */}
                {card.frozen && (
                  <div className="absolute top-4 right-4 rounded-full bg-red-500/20 text-red-200 border border-red-500/35 py-1 px-3 text-[10px] font-extrabold tracking-wide">
                    TARJETA CONGELADA
                  </div>
                )}
              </div>

              {/* Acciones de la Tarjeta (Congelar, Eliminar) */}
              <div className="w-full md:w-auto md:min-w-47.5 flex flex-col gap-3">
                <button
                  className="border border-violet-400/25 rounded-2xl min-h-13 flex items-center justify-center gap-2.5 cursor-pointer font-extrabold text-sm bg-violet-600/18 text-violet-200 transition-colors hover:bg-violet-600/28 active:scale-[0.98]"
                  onClick={() => openFreezeConfirmation(card.id)}
                  type="button"
                >
                  <Snowflake size={18} />
                  <span>
                    {card.frozen
                      ? "Descongelar tarjeta"
                      : "Congelar tarjeta"}
                  </span>
                </button>

                <button
                  className="border border-rose-500/25 rounded-2xl min-h-13 flex items-center justify-center gap-2.5 cursor-pointer font-extrabold text-sm bg-rose-500/12 text-rose-400 transition-colors hover:bg-rose-500/20 active:scale-[0.98]"
                  onClick={() => openDeleteConfirmation(card.id)}
                  type="button"
                >
                  <TriangleAlert size={18} />
                  <span>Dar de baja</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Botón Solicitar nueva tarjeta */}
      <button
        className="w-full border-none rounded-2xl min-h-13 flex items-center justify-center gap-2.5 cursor-pointer font-extrabold text-sm bg-linear-to-br from-violet-600 to-purple-500 text-white transition-all hover:brightness-110 active:scale-[0.98]"
        onClick={() => setShowRequestModal(true)}
        type="button"
      >
        <CreditCard size={18} />
        Solicitar nueva tarjeta
      </button>

      {/* ================= MODAL: VER CVV ================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-999 p-4 backdrop-blur-xs">
          <div className="w-full max-w-97.5 bg-[#111128] border border-violet-500/30 rounded-[18px] p-7 shadow-2xl flex flex-col gap-4">
            <h3 className="m-0 text-white text-lg font-bold">Ver CVV</h3>
            <p className="m-0 text-sm text-violet-300">
              Por seguridad, ingresá nuevamente la contraseña con la que iniciaste sesión.
            </p>

            <input
              type="password"
              placeholder="Contraseña"
              value={cvvPassword}
              onChange={(e) => setCvvPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-violet-500/35 bg-white/5 text-white text-sm focus:outline-none focus:border-violet-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleVerifyCvvPassword();
                }
              }}
            />

            <p className="text-rose-400 font-bold text-xs">No compartas estos datos.</p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="bg-white/10 text-white rounded-lg py-2 px-4 cursor-pointer font-bold text-sm hover:bg-white/15 transition-all"
                onClick={() => {
                  setShowPasswordModal(false);
                  setCvvPassword("");
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="bg-violet-600 text-white rounded-lg py-2 px-4 cursor-pointer font-bold text-sm hover:bg-violet-500 transition-all"
                onClick={handleVerifyCvvPassword}
              >
                Ver CVV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONGELAR ================= */}
      {showFreezeModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-999 p-4 backdrop-blur-xs">
          <div className="w-full max-w-97.5 bg-[#111128] border border-violet-500/30 rounded-[18px] p-7 shadow-2xl flex flex-col gap-4">
            <h3 className="m-0 text-white text-lg font-bold">¿Está seguro?</h3>
            <p className="m-0 text-sm text-violet-300">
              Ingresá tu contraseña para confirmar que querés{" "}
              {selectedFreezeCard?.frozen ? "descongelar" : "congelar"} esta tarjeta.
            </p>

            <input
              type="password"
              placeholder="Contraseña"
              value={freezePassword}
              onChange={(e) => setFreezePassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-violet-500/35 bg-white/5 text-white text-sm focus:outline-none focus:border-violet-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmFreeze();
                }
              }}
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="bg-white/10 text-white rounded-lg py-2 px-4 cursor-pointer font-bold text-sm hover:bg-white/15 transition-all"
                onClick={() => {
                  setShowFreezeModal(false);
                  setFreezePassword("");
                }}
              >
                Cancelar
              </button>

              <button 
                type="button" 
                className="bg-violet-600 text-white rounded-lg py-2 px-4 cursor-pointer font-bold text-sm hover:bg-violet-500 transition-all"
                onClick={confirmFreeze}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ELIMINAR/BAJA ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-999 p-4 backdrop-blur-xs">
          <div className="w-full max-w-97.5 bg-[#111128] border border-violet-500/30 rounded-[18px] p-7 shadow-2xl flex flex-col gap-4">
            <h3 className="m-0 text-white text-lg font-bold">¿Está seguro?</h3>
            <p className="m-0 text-sm text-violet-300">
              Ingresá tu contraseña para confirmar la baja de{" "}
              {selectedDeleteCard?.type}. Esta acción eliminará la tarjeta de tu listado.
            </p>

            <input
              type="password"
              placeholder="Contraseña"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-violet-500/35 bg-white/5 text-white text-sm focus:outline-none focus:border-violet-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmDelete();
                }
              }}
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="bg-white/10 text-white rounded-lg py-2 px-4 cursor-pointer font-bold text-sm hover:bg-white/15 transition-all"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
              >
                Cancelar
              </button>

              <button 
                type="button" 
                className="bg-rose-600 text-white rounded-lg py-2 px-4 cursor-pointer font-bold text-sm hover:bg-rose-500 transition-all"
                onClick={confirmDelete}
              >
                Dar de baja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SOLICITAR NUEVA TARJETA ================= */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-999 p-4 backdrop-blur-xs">
          <div className="w-full max-w-97.5 bg-[#111128] border border-violet-500/30 rounded-[18px] p-7 shadow-2xl flex flex-col gap-4">
            <h3 className="m-0 text-white text-lg font-bold">Solicitar nueva tarjeta</h3>
            <p className="m-0 text-sm text-violet-300">Elegí el tipo de tarjeta que querés solicitar.</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                className={`min-h-12 border rounded-xl cursor-pointer font-bold text-sm transition-all ${
                  newCardType === "debito"
                    ? "border-violet-500 bg-violet-600/20 text-white ring-2 ring-violet-500/30"
                    : "border-violet-500/25 bg-white/5 text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setNewCardType("debito")}
                type="button"
              >
                Débito
              </button>

              <button
                className={`min-h-12 border rounded-xl cursor-pointer font-bold text-sm transition-all ${
                  newCardType === "credito"
                    ? "border-violet-500 bg-violet-600/20 text-white ring-2 ring-violet-500/30"
                    : "border-violet-500/25 bg-white/5 text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setNewCardType("credito")}
                type="button"
              >
                Crédito
              </button>
            </div>

            <p className="text-rose-400 font-bold text-xs">
              El número de tarjeta y el CVV se generarán automáticamente.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="bg-white/10 text-white rounded-lg py-2 px-4 cursor-pointer font-bold text-sm hover:bg-white/15 transition-all"
                onClick={() => {
                  setShowRequestModal(false);
                  setNewCardType("debito");
                }}
              >
                Cancelar
              </button>

              <button 
                type="button" 
                className="bg-violet-600 text-white rounded-lg py-2 px-4 cursor-pointer font-bold text-sm hover:bg-violet-500 transition-all"
                onClick={requestNewCard}
              >
                Solicitar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CardSummary;