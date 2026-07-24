import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle2 } from "lucide-react";
import { useBank } from "../../context/BankContext";

const initialDraft = {
  query: "",
  recipient: null,
  addContact: false,
  reference: "",
  amount: "",
  message: "",
  password: "",
};

function TransferModal({ isOpen, onClose, recipient }) {
  const navigate = useNavigate();
  const { currentUser, transfer, addContact, resolveRecipient, verifyPassword } = useBank();

  const [step, setStep] = useState("search");
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState("");

  const client = currentUser || {
    id: "",
    balance: 0,
  };

  useEffect(() => {
    if (!isOpen) return;

    if (recipient) {
      setStep("amount");
      setDraft({
        ...initialDraft,
        recipient: {
          id: recipient.id,
          name: recipient.name,
          alias: recipient.alias,
          cbu: recipient.cbu,
          bank: recipient.bank,
          reference: recipient.reference,
        },
      });
    } else {
      setStep("search");
      setDraft(initialDraft);
    }

    setError("");
  }, [isOpen, recipient]);

  if (!isOpen) return null;

  const formatMoney = (value) =>
    Number(value).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });

  const handleSearchRecipient = async () => {
    const normalized = draft.query.trim();

    if (!normalized) {
      setError("Ingrese un valor para buscar.");
      return;
    }

    const foundUser = await resolveRecipient(normalized);

    if (!foundUser) {
      setError("No se encontró ninguna cuenta con ese CBU, CVU o alias.");
      return;
    }

    setDraft((current) => ({
      ...current,
      recipient: {
        name: foundUser.nombre,
        alias: foundUser.alias,
        cbu: foundUser.cbu,
        bank: "NovaBank",
      },
      reference: foundUser.nombre,
    }));

    setError("");
    setStep("verify");
  };

  const confirmRecipient = async () => {
    if (!draft.recipient) {
      setError("No hay destinatario seleccionado.");
      return;
    }

    if (draft.addContact) {
      const result = await addContact({
        name: draft.recipient.name,
        alias: draft.recipient.alias,
        cbu: draft.recipient.cbu,
        bank: draft.recipient.bank,
        reference: draft.reference || draft.recipient.name,
      });

      if (!result.success) {
        setError(result.error || "No se pudo agendar el contacto.");
        return;
      }
    }

    setError("");
    setStep("amount");
  };

  const confirmAmount = () => {
    const amount = Number(draft.amount);

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      setError("Ingresá un monto válido.");
      return;
    }

    if (amount > Number(client.balance)) {
      setError("Saldo insuficiente.");
      return;
    }

    setError("");
    setStep("message");
  };

  const finishTransfer = async () => {
    if (!draft.recipient) {
      setError("No hay destinatario seleccionado.");
      return;
    }

    const passwordValida = await verifyPassword(draft.password);

    if (!passwordValida) {
      setError("La contraseña ingresada es incorrecta.");
      return;
    }

    const result = await transfer(
      draft.recipient.cbu || draft.recipient.alias,
      Number(draft.amount),
      draft.message.trim()
    );

    if (!result.success) {
      setError(result.error || "Error al realizar la transferencia.");
      return;
    }

    setError("");
    setStep("success");
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-999 p-4"
      role="dialog"
      aria-modal="true"
    >
      <section className="relative w-full max-w-105 bg-[#111128] border border-violet-500/20 rounded-[28px] p-6 sm:p-8 flex flex-col gap-5 shadow-2xl">
        {step !== "success" && (
          <button
            type="button"
            className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        )}

        {step === "search" && (
          <>
            <h2 className="text-xl font-bold text-white">Transferir a una nueva cuenta</h2>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ingrese CBU, CVU o Alias
              </label>
              <input
                type="text"
                value={draft.query}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, query: event.target.value }))
                }
                placeholder="alias o CBU/CVU"
                className="w-full p-3 rounded-xl border border-violet-500/35 bg-white/5 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            {error && (
  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm font-semibold">
    {error}
  </div>
)}

            <button
              type="button"
              className="w-full py-3.5 rounded-xl bg-linear-to-br from-violet-600 to-purple-500 text-white font-bold text-sm cursor-pointer hover:brightness-110 active:scale-98 transition-all"
              onClick={handleSearchRecipient}
            >
              Continuar
            </button>
          </>
        )}

        {step === "verify" && (
          <>
            <h2 className="text-xl font-bold text-white">Verificá los datos</h2>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Nombre</p>
                <strong className="text-sm text-slate-200">{draft.recipient.name}</strong>
              </div>

              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Alias</p>
                <strong className="text-sm text-slate-200">{draft.recipient.alias}</strong>
              </div>

              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Banco</p>
                <strong className="text-sm text-slate-200">{draft.recipient.bank}</strong>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.addContact}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, addContact: event.target.checked }))
                }
                className="rounded border-slate-700 text-violet-600 focus:ring-violet-500 w-4 h-4 bg-white/5"
              />
              Agendar contacto
            </label>

            {draft.addContact && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Referencia o apodo
                </label>
                <input
                  type="text"
                  value={draft.reference}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, reference: event.target.value }))
                  }
                  className="w-full p-3 rounded-xl border border-violet-500/35 bg-white/5 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end mt-4">
              <button
                type="button"
                className="bg-white/10 text-white rounded-lg py-2.5 px-4.5 cursor-pointer font-bold text-sm hover:bg-white/15 transition-all"
                onClick={() => setStep("search")}
              >
                Volver
              </button>

              <button
                type="button"
                className="bg-violet-600 text-white rounded-lg py-2.5 px-4.5 cursor-pointer font-bold text-sm hover:bg-violet-500 transition-all"
                onClick={confirmRecipient}
              >
                Confirmar
              </button>
            </div>
          </>
        )}

        {step === "amount" && (
          <>
            <h2 className="text-xl font-bold text-white">Ingresá el monto</h2>

            {draft.recipient && (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                  Destinatario
                </p>
                <strong className="text-sm text-slate-200">
                  {draft.recipient.reference || draft.recipient.name}
                </strong>
                <p className="text-xs text-slate-400">{draft.recipient.alias}</p>
              </div>
            )}

            <div className="flex items-center justify-between bg-violet-950/20 border border-violet-500/10 rounded-2xl p-4">
              <span className="text-xs text-[#8b87a5] uppercase font-bold tracking-wide">
                Saldo disponible
              </span>
              <strong className="text-sm text-slate-100">{formatMoney(client.balance)}</strong>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Monto
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={draft.amount}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    amount: event.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="0"
                className="w-full p-3 rounded-xl border border-violet-500/35 bg-white/5 text-white text-lg font-bold focus:outline-none focus:border-violet-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {error && (
  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm font-semibold">
    {error}
  </div>
)}

            <button
              type="button"
              className="w-full py-3.5 rounded-xl bg-linear-to-br from-violet-600 to-purple-500 text-white font-bold text-sm cursor-pointer hover:brightness-110 active:scale-98 transition-all"
              onClick={confirmAmount}
            >
              Continuar
            </button>
          </>
        )}

        {step === "message" && (
          <>
            <h2 className="text-xl font-bold text-white">Agregar un mensaje (opcional)</h2>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Mensaje
              </label>
              <textarea
                value={draft.message}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, message: event.target.value }))
                }
                rows="4"
                placeholder="Escribí un mensaje"
                className="w-full p-3 rounded-xl border border-violet-500/35 bg-white/5 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            <button
              type="button"
              className="w-full py-3.5 rounded-xl bg-linear-to-br from-violet-600 to-purple-500 text-white font-bold text-sm cursor-pointer hover:brightness-110 active:scale-98 transition-all"
              onClick={() => setStep("summary")}
            >
              Continuar
            </button>
          </>
        )}

        {step === "summary" && (
          <>
            <h2 className="text-xl font-bold text-white">Verificá los datos</h2>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-y-3 gap-x-4">
              <span className="text-xs text-slate-500 font-bold">Destinatario</span>
              <strong className="text-xs text-slate-200 justify-self-end text-right">
                {draft.recipient.name}
              </strong>

              <span className="text-xs text-slate-500 font-bold">Alias</span>
              <strong className="text-xs text-slate-200 justify-self-end text-right">
                {draft.recipient.alias}
              </strong>

              <span className="text-xs text-slate-500 font-bold">Banco</span>
              <strong className="text-xs text-slate-200 justify-self-end text-right">
                {draft.recipient.bank}
              </strong>

              <span className="text-xs text-slate-500 font-bold">Monto</span>
              <strong className="text-xs text-emerald-400 justify-self-end text-right">
                {formatMoney(Number(draft.amount))}
              </strong>

              {draft.message.trim() && (
                <>
                  <span className="text-xs text-slate-500 font-bold">Mensaje</span>
                  <strong className="text-xs text-slate-200 justify-self-end text-right truncate max-w-37.5">
                    {draft.message.trim()}
                  </strong>
                </>
              )}
            </div>

            <button
              type="button"
              className="w-full py-3.5 rounded-xl bg-linear-to-br from-violet-600 to-purple-500 text-white font-bold text-sm cursor-pointer hover:brightness-110 active:scale-98 transition-all"
              onClick={() => setStep("password")}
            >
              Confirmar transferencia
            </button>
          </>
        )}

        {step === "password" && (
          <>
            <h2 className="text-xl font-bold text-white">Confirmá tu contraseña</h2>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Contraseña
              </label>
              <input
                type="password"
                value={draft.password}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Ingresá tu contraseña"
                className="w-full p-3 rounded-xl border border-violet-500/35 bg-white/5 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            {error && (
  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm font-semibold">
    {error}
  </div>
)}

            <button
              type="button"
              className="w-full py-3.5 rounded-xl bg-linear-to-br from-violet-600 to-purple-500 text-white font-bold text-sm cursor-pointer hover:brightness-110 transition-all"
              onClick={finishTransfer}
            >
              Confirmar
            </button>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center py-6">
            <CheckCircle2 size={58} className="text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Transferencia realizada con éxito.</h2>

            <button
              type="button"
              className="w-full py-3.5 rounded-xl bg-linear-to-br from-violet-600 to-purple-500 text-white font-bold text-sm cursor-pointer hover:brightness-110 transition-all"
              onClick={() => navigate("/cliente")}
            >
              Aceptar
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default TransferModal;