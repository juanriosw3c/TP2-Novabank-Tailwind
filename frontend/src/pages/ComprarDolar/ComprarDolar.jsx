import { useState } from "react"
import { Link } from "react-router-dom"
import {
  DollarSign, ArrowUpDown, Lock, AlertCircle,
  PiggyBank, TrendingUp, ChevronLeft, ShieldCheck,
} from "lucide-react"
import logo from "../../assets/logo.png"

import { useBank } from "../../context/BankContext"

const COTIZACIONES = [
  { id: "oficial", label: "DÓLAR OFICIAL", precio: 1250, variacion: +0.4 },
  { id: "mep",     label: "DÓLAR MEP",     precio: 1310, variacion: +1.1 },
  { id: "cripto",  label: "DÓLAR CRIPTO",  precio: 1290, variacion: -0.2 },
]

const DESTINOS = [
  { id: "caja",    label: "Caja de ahorro", sub: "USD · Disponible 24/7",    icon: PiggyBank },
  { id: "mep-inv", label: "Inversión MEP",  sub: "Bonos · Mayor rendimiento", icon: TrendingUp },
]

function ComprarDolar() {
  const { currentUser, buyDollars } = useBank();
  const [tipoSeleccionado, setTipoSeleccionado] = useState("oficial")
  const [montoARS, setMontoARS] = useState("")
  const [destino, setDestino] = useState("caja")

  const SALDO_ARS = currentUser?.balance || 1248370.5;

  const cotizacion = COTIZACIONES.find((c) => c.id === tipoSeleccionado)
  const montoNumerico = parseFloat(montoARS) || 0
  const montoUSD =
    montoNumerico > 0
      ? (montoNumerico / cotizacion.precio).toFixed(2).replace(".", ",")
      : "0,00"

  const montoValido = montoNumerico > 0 && montoNumerico <= SALDO_ARS
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleComprar = async () => {
    setError("")
    const result = await buyDollars(montoNumerico, cotizacion.precio, tipoSeleccionado, destino)
    if (!result.success) return setError(result.error)
    setSuccess("Compra realizada correctamente.")
    setMontoARS("")
  }

  return (
    <div className="min-h-dvh w-full bg-[#070713] text-white">

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 left-1/4 w-96 h-96 bg-violet-900/15 rounded-full blur-3xl" />
        <div className="absolute top-60 right-0 w-72 h-72 bg-emerald-900/8 rounded-full blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="relative flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#070713]">
        <Link
          to="/cliente"
          className="w-10 h-10 flex items-center justify-center bg-white/6 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-gray-300 hover:text-white"
        >
          <ChevronLeft size={20} />
        </Link>

        <div className="flex items-center gap-2">
          <img src={logo} alt="NovaBank" className="h-6 w-auto" />
        </div>

        <div className="w-10 h-10 rounded-full bg-linear-to-br from-violet-500 to-violet-700 flex items-center justify-center font-bold text-sm select-none">
          FG
        </div>
      </header>

      <div className="relative w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 pt-7 pb-28">

        {/* PAGE TITLE */}
        <div className="flex items-center gap-3 mb-1.5">
          <div className="bg-violet-500/20 p-2.5 rounded-xl shrink-0">
            <DollarSign size={20} className="text-violet-400" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Comprar dólar</h1>
        </div>
        <p className="text-gray-500 text-sm mb-7 pl-13">
          Cotizaciones en tiempo real · Operación instantánea
        </p>

        {/* COTIZACIONES */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {COTIZACIONES.map((c) => {
            const activo = tipoSeleccionado === c.id
            const positivo = c.variacion >= 0
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setTipoSeleccionado(c.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  activo
                    ? "bg-violet-900/20 border-violet-500/40"
                    : "bg-white/4 border-white/8 hover:bg-white/8"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[9px] font-semibold tracking-widest text-gray-400 uppercase leading-none">
                    {c.label}
                  </p>
                  {activo && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
                </div>
                <p className="text-xl font-bold leading-none mb-1.5">
                  ${c.precio.toLocaleString("es-AR")}
                </p>
                <p className={`text-xs font-medium ${positivo ? "text-emerald-400" : "text-red-400"}`}>
                  {positivo ? "+" : ""}{c.variacion}% hoy
                </p>
              </button>
            )
          })}
        </div>

        {/* MONTO A COMPRAR */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase mb-5">
            Monto a comprar
          </p>

          {/* ARS */}
          <p className="text-sm text-gray-400 mb-2">Pagás en pesos</p>
          <div
            className={`flex items-center rounded-xl border transition-all overflow-hidden ${
              montoARS && !montoValido ? "border-red-500/40" : "border-violet-500/30"
            } bg-white/5`}
          >
            <span className="bg-violet-500/20 text-violet-300 text-xs font-bold px-3 py-3.5 border-r border-violet-500/20 whitespace-nowrap shrink-0">
              ARS $
            </span>
            <input
              type="number"
              placeholder="0"
              value={montoARS}
              onChange={(e) => setMontoARS(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-600 text-lg font-semibold px-4 py-3 focus:outline-none min-w-0"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Saldo disponible:{" "}
            <span className="text-white font-medium">
              ${SALDO_ARS.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          </p>

          {/* Swap */}
          <div className="flex justify-center my-5">
            <div className="w-9 h-9 rounded-full bg-violet-600/25 border border-violet-500/30 flex items-center justify-center">
              <ArrowUpDown size={15} className="text-violet-400" strokeWidth={2} />
            </div>
          </div>

          {/* USD */}
          <p className="text-sm text-gray-400 mb-2">Recibís en dólares</p>
          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <span className="bg-emerald-500/15 text-emerald-400 text-xs font-bold px-3 py-3.5 border-r border-emerald-500/20 whitespace-nowrap shrink-0">
              USD $
            </span>
            <span className="flex-1 text-emerald-400 text-xl font-bold px-4 py-3">
              {montoUSD}
            </span>
          </div>

          {/* Resumen */}
          <div className="mt-5 pt-4 border-t border-white/8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tipo de cambio</span>
              <span className="text-white font-medium">
                ${cotizacion.precio.toLocaleString("es-AR")} / USD
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tipo seleccionado</span>
              <span className="text-violet-400 font-semibold">
                {cotizacion.id === "oficial" ? "Oficial" : cotizacion.id === "mep" ? "MEP" : "Cripto"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Comisión NovaBank</span>
              <span className="text-emerald-400 font-semibold">Sin cargo</span>
            </div>
          </div>
        </div>

        {/* DESTINO */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase mb-4">
            ¿Dónde guardar tus dólares?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {DESTINOS.map((d) => {
              const Icon = d.icon
              const activo = destino === d.id
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDestino(d.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    activo
                      ? "border-violet-500/40 bg-violet-900/20"
                      : "border-white/8 bg-white/4 hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${activo ? "bg-violet-500/20" : "bg-white/8"}`}>
                      <Icon
                        size={15}
                        className={activo ? "text-violet-400" : "text-gray-400"}
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-none truncate">{d.label}</p>
                      <p className="text-gray-500 text-[11px] mt-1 truncate">{d.sub}</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border shrink-0 ml-2 flex items-center justify-center transition-all ${
                      activo ? "border-violet-400 bg-violet-500" : "border-white/20"
                    }`}
                  >
                    {activo && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* WARNING */}
        <div className="flex gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-6">
          <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" strokeWidth={1.75} />
          <p className="text-amber-300/80 text-xs leading-relaxed">
            Las operaciones de cambio se procesan en días hábiles bancarios. El tipo de cambio puede
            variar levemente al momento de confirmar la operación.
          </p>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleComprar}
          disabled={!montoValido}
          className="w-full py-4 rounded-2xl bg-white text-[#070713] font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-gray-100 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Lock size={14} strokeWidth={2.5} />
          Confirmá el monto para continuar
        </button>
        {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
        {success && <p className="mt-3 text-center text-sm text-emerald-400">{success}</p>}
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-5 pointer-events-none">
        <p className="text-gray-600 text-[11px] flex items-center gap-1.5">
          <ShieldCheck size={13} />
          Tu seguridad es nuestra prioridad. Cifrado de extremo a extremo.
        </p>
      </div>

    </div>
  )
}

export default ComprarDolar
