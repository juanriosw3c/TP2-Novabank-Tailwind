import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useBank } from "../../context/BankContext";

import BalanceCard from "../../components/Dashboard/BalanceCard";
import DashboardNavbar from "../../components/Dashboard/DashboardNavbar";
import InvestmentsList from "../../components/Dashboard/InvestmentsList";
import MovementsList from "../../components/Dashboard/MovementsList";
import QuickActions from "../../components/Dashboard/QuickActions";
import Sidebar from "../../components/Dashboard/Sidebar";
import { dashboardData } from "../../data/mockData";

function DashboardCliente() {
  const { currentUser, transactions, loadMovements } = useBank();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Usuario activo o fallback por si recargan la página
  const client = currentUser || {
    id: "cliente-1",
    name: "Federico García",
    initials: "FG",
    status: "Cuenta activa",
    balance: 1248370.50,
  };

  useEffect(() => {
    if (currentUser) loadMovements().catch(() => {});
  }, []);

  // Filtrar los movimientos que le pertenecen a este usuario
  const movements = transactions.filter(t => t.userId === client.id);

  // Formatear saldo
  const formattedBalance = `$ ${client.balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

  return (
    <main className="min-h-screen bg-[#070713] text-slate-50 pb-8 pt-23">
      <DashboardNavbar
        userInitials={client.initials}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isAdmin={false}
      />

      <div className="w-full max-w-295 mx-auto px-4 md:px-8 pt-10 transition-[margin-left] duration-300">
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[#8b87a5] text-[1.1rem] mb-1.5">Buen día,</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              {client.name} <span className="text-2xl">👋</span>
            </h1>
          </div>

          <span className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/35 bg-emerald-500/12 text-emerald-400 py-2.5 px-4 font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            {client.status}
          </span>
        </section>

        <BalanceCard
          balance={formattedBalance}
          monthlyChange={dashboardData.monthlyChange}
          updatedAt={dashboardData.updatedAt}
          stats={dashboardData.stats}
        />
        {/* Botones de acciones rápidas */}
        <QuickActions actions={dashboardData.quickActions} />
        {/* Grilla inferior: Movimientos e Inversiones */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <MovementsList movements={movements} />
          <div className="grid gap-6">
            <InvestmentsList investments={dashboardData.investments} />
          </div>
        </section>
      </div>
      {/* Footer de seguridad */}
      <footer className="flex items-center justify-center gap-2 text-[#4c466c] text-sm mt-8">
        <Eye size={16} />
        Tu seguridad es nuestra prioridad. Cifrado de extremo a extremo CLIENTE.
      </footer>
    </main>
  );
}

export default DashboardCliente;
