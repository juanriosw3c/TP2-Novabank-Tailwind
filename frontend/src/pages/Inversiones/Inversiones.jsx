import { useState } from "react"
import { Link } from "react-router-dom"
import {
  TrendingUp, PieChart, DollarSign, Building2,
  ArrowUpRight, ArrowDownRight, X
} from "lucide-react"
import { useBank } from "../../context/BankContext";

const OPCIONES = [
  { id: "plazo-fijo", label: "Plazo fijo UVA", icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/20" },
  { id: "fondo-comun", label: "Fondo comun", icon: PieChart, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  { id: "dolar-mep", label: "Dolar MEP", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/15" },
  { id: "acciones", label: "Acciones", icon: Building2, color: "text-teal-400", bg: "bg-teal-500/15" },
]

function ModalNuevaInversion({ onClose, onConfirmar }) {
  const [tipo, setTipo] = useState("")
  const [monto, setMonto] = useState("")
  const [error, setError] = useState("")
  const [exito, setExito] = useState(false)   // 👈 nuevo estado

  async function handleConfirmar(e) {
    e.preventDefault()
    if (!tipo || !monto) return
    const result = await onConfirmar(tipo, monto)
    if (!result.success) {
      setError(result.error)
      return
    }
    setExito(true)              // 👈 mostrar pantalla de éxito
    setTimeout(onClose, 2000)   // 👈 cerrar automáticamente después de 2 seg
  }

  // Pantalla de éxito
  if (exito) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative w-full max-w-md bg-[#0f0f1a] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-4">
          <div className="bg-emerald-500/15 p-4 rounded-2xl">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">¡Inversión creada!</h2>
          <p className="text-gray-500 text-sm">Tu inversión fue procesada con éxito.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#0f0f1a] border border-white/10 rounded-3xl p-6 shadow-2xl">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold">Nueva inversion</h2>
            <p className="text-gray-500 text-sm mt-0.5">Elegí tipo y monto</p>
          </div>
          <button onClick={onClose} className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-xl transition-all">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleConfirmar}>

          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Tipo de inversion</p>
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {OPCIONES.map((op) => {
              const Icon = op.icon
              const seleccionado = tipo === op.id
              return (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setTipo(op.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    seleccionado
                      ? "border-white/30 bg-white/10"
                      : "border-white/8 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <div className={`${op.bg} p-2 rounded-lg flex-shrink-0`}>
                    <Icon size={15} className={op.color} strokeWidth={1.75} />
                  </div>
                  <span className="text-sm font-medium">{op.label}</span>
                </button>
              )
            })}
          </div>

          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Monto a invertir</p>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
            <input
              type="number"
              placeholder="0"
              value={monto}
              onChange={(e) => { setMonto(e.target.value); setError("") }}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-white placeholder-gray-600 text-lg font-semibold focus:outline-none focus:border-white/25 transition-all"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-4 px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={!tipo || !monto}
            className="w-full py-4 rounded-xl bg-white text-[#070713] font-bold text-sm transition-all hover:bg-gray-100 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Confirmar inversion
          </button>

        </form>
      </div>
    </div>
  )
}

function Inversiones() {
  const { createInvestment } = useBank()
  const [modalAbierto, setModalAbierto] = useState(false)

  return (
    <div className="min-h-[100dvh] w-full bg-[#070713] text-white">

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 left-1/3 w-96 h-96 bg-violet-900/15 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-emerald-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 pt-8 lg:pt-12 pb-32">

        <header className="flex items-center justify-between mb-10 lg:mb-14">
          <div className="flex items-center gap-4">
            <Link
              to="/cliente"
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white transition-all"
            >
              ← Volver
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight leading-none">Inversiones</h1>
              <p className="text-gray-500 text-sm mt-1">Hace crecer tu dinero</p>
            </div>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="hidden sm:block bg-white/8 hover:bg-white/12 active:scale-[0.98] border border-white/12 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            + Nueva inversion
          </button>
        </header>

        <section className="grid grid-cols-3 gap-4 lg:gap-5 mb-10 lg:mb-14">
          <div className="bg-white/5 border border-white/8 rounded-2xl p-4 lg:p-6">
            <p className="text-gray-500 text-[10px] lg:text-xs uppercase tracking-widest mb-3">Total invertido</p>
            <p className="text-2xl lg:text-3xl font-bold leading-none mb-2">$320.000</p>
            <p className="text-emerald-400 text-xs lg:text-sm flex items-center gap-0.5">
              <ArrowUpRight size={13} strokeWidth={2.5} />
              3 activos
            </p>
          </div>
          <div className="bg-white/5 border border-white/8 rounded-2xl p-4 lg:p-6">
            <p className="text-gray-500 text-[10px] lg:text-xs uppercase tracking-widest mb-3">Ganancia total</p>
            <p className="text-2xl lg:text-3xl font-bold leading-none text-emerald-400 mb-2">+$28.450</p>
            <p className="text-gray-500 text-xs lg:text-sm">+8,9% desde inicio</p>
          </div>
          <div className="bg-white/5 border border-white/8 rounded-2xl p-4 lg:p-6">
            <p className="text-gray-500 text-[10px] lg:text-xs uppercase tracking-widest mb-3">Rendimiento mes</p>
            <p className="text-2xl lg:text-3xl font-bold leading-none text-amber-400 mb-2">+$4.200</p>
            <p className="text-gray-500 text-xs lg:text-sm">+1,3% este mes</p>
          </div>
        </section>

        <section className="mb-10 lg:mb-14">
          <h2 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">
            Opciones de inversion
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:gap-5">
            <div className="bg-gradient-to-br from-violet-950/80 to-violet-900/20 border border-violet-500/25 rounded-2xl p-5 lg:p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-violet-500/20 p-2.5 rounded-xl">
                  <TrendingUp size={20} className="text-violet-400" strokeWidth={1.75} />
                </div>
                <span className="bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Recomendado
                </span>
              </div>
              <p className="font-semibold text-white text-base lg:text-lg mb-1">Plazo fijo UVA</p>
              <p className="text-gray-500 text-sm mb-6">Ajuste por inflacion + tasa fija</p>
              <div className="flex justify-between">
                <div><p className="text-gray-500 text-xs mb-1">Rendimiento</p><p className="text-emerald-400 font-bold text-sm lg:text-base">+118% anual</p></div>
                <div className="text-right"><p className="text-gray-500 text-xs mb-1">Minimo</p><p className="font-bold text-sm lg:text-base">$1.000</p></div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5 lg:p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-emerald-500/15 p-2.5 rounded-xl">
                  <PieChart size={20} className="text-emerald-400" strokeWidth={1.75} />
                </div>
                <span className="bg-amber-500/15 text-amber-400 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-amber-500/20">
                  Moderado
                </span>
              </div>
              <p className="font-semibold text-white text-base lg:text-lg mb-1">Fondo comun</p>
              <p className="text-gray-500 text-sm mb-6">Cartera diversificada de activos</p>
              <div className="flex justify-between">
                <div><p className="text-gray-500 text-xs mb-1">Rendimiento</p><p className="text-emerald-400 font-bold text-sm lg:text-base">+95% anual</p></div>
                <div className="text-right"><p className="text-gray-500 text-xs mb-1">Minimo</p><p className="font-bold text-sm lg:text-base">$5.000</p></div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5 lg:p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-amber-500/15 p-2.5 rounded-xl">
                  <DollarSign size={20} className="text-amber-400" strokeWidth={1.75} />
                </div>
                <span className="bg-orange-500/15 text-orange-400 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-orange-500/20">
                  Popular
                </span>
              </div>
              <p className="font-semibold text-white text-base lg:text-lg mb-1">Compra de dolar MEP</p>
              <p className="text-gray-500 text-sm mb-6">Dolariza tus ahorros</p>
              <div className="flex justify-between">
                <div><p className="text-gray-500 text-xs mb-1">Cotizacion</p><p className="text-amber-400 font-bold text-sm lg:text-base">$1.247</p></div>
                <div className="text-right"><p className="text-gray-500 text-xs mb-1">Minimo</p><p className="font-bold text-sm lg:text-base">$10.000</p></div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5 lg:p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-teal-500/15 p-2.5 rounded-xl">
                  <Building2 size={20} className="text-teal-400" strokeWidth={1.75} />
                </div>
                <span className="bg-red-500/15 text-red-400 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-red-500/20">
                  Alto riesgo
                </span>
              </div>
              <p className="font-semibold text-white text-base lg:text-lg mb-1">Acciones</p>
              <p className="text-gray-500 text-sm mb-6">Compra acciones del Merval</p>
              <div className="flex justify-between">
                <div><p className="text-gray-500 text-xs mb-1">Variacion hoy</p><p className="text-emerald-400 font-bold text-sm lg:text-base">+2,4%</p></div>
                <div className="text-right"><p className="text-gray-500 text-xs mb-1">Minimo</p><p className="font-bold text-sm lg:text-base">$500</p></div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">
            Mis inversiones activas
          </h2>
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5 lg:p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-violet-500/20 p-2.5 rounded-xl flex-shrink-0">
                    <TrendingUp size={18} className="text-violet-400" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm lg:text-base">Plazo fijo UVA</p>
                    <p className="text-gray-500 text-xs lg:text-sm mt-0.5">Vence 15 jul · 30 dias</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-bold text-sm lg:text-base">$150.000</p>
                  <p className="text-emerald-400 text-xs lg:text-sm mt-0.5 flex items-center justify-end gap-0.5">
                    <ArrowUpRight size={12} strokeWidth={2.5} />+$13.200 (+8,8%)
                  </p>
                </div>
              </div>
              <div className="w-full bg-white/8 rounded-full h-[3px]">
                <div className="bg-gradient-to-r from-violet-600 to-violet-400 h-[3px] rounded-full" style={{ width: "85%" }} />
              </div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5 lg:p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-emerald-500/15 p-2.5 rounded-xl flex-shrink-0">
                    <PieChart size={18} className="text-emerald-400" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm lg:text-base">Fondo comun de inversion</p>
                    <p className="text-gray-500 text-xs lg:text-sm mt-0.5">Rescate 24hs · Liquidez media</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-bold text-sm lg:text-base">$120.000</p>
                  <p className="text-emerald-400 text-xs lg:text-sm mt-0.5 flex items-center justify-end gap-0.5">
                    <ArrowUpRight size={12} strokeWidth={2.5} />+$9.800 (+8,2%)
                  </p>
                </div>
              </div>
              <div className="w-full bg-white/8 rounded-full h-[3px]">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-[3px] rounded-full" style={{ width: "65%" }} />
              </div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5 lg:p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-amber-500/15 p-2.5 rounded-xl flex-shrink-0">
                    <DollarSign size={18} className="text-amber-400" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm lg:text-base">Dolar MEP</p>
                    <p className="text-gray-500 text-xs lg:text-sm mt-0.5">250 USD · Cotizacion $1.247</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-bold text-sm lg:text-base">$50.000</p>
                  <p className="text-red-400 text-xs lg:text-sm mt-0.5 flex items-center justify-end gap-0.5">
                    <ArrowDownRight size={12} strokeWidth={2.5} />-$4.100 (-3,2%)
                  </p>
                </div>
              </div>
              <div className="w-full bg-white/8 rounded-full h-[3px]">
                <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-[3px] rounded-full" style={{ width: "30%" }} />
              </div>
            </div>
          </div>
        </section>

      </div>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 px-6 pb-6 pt-4 bg-gradient-to-t from-[#070713] to-transparent">
        <button
          onClick={() => setModalAbierto(true)}
          className="w-full py-4 rounded-2xl bg-white/8 hover:bg-white/12 active:scale-[0.98] border border-white/12 text-white font-semibold text-sm transition-all"
        >
          + Nueva inversion
        </button>
      </div>

      {modalAbierto && (
        <ModalNuevaInversion
          onClose={() => setModalAbierto(false)}
          onConfirmar={createInvestment}
        />
      )}

    </div>
  )
}

export default Inversiones