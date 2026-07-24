/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { USERS, TRANSACTIONS } from "../data/mockData";

const BankContext = createContext();

const API_URL = "http://localhost:8888/api/auth";
const API_BASE = "http://localhost:8888/api";

const normalizeUser = (usuario) => ({
  ...usuario,
  name: usuario.nombre ?? usuario.name,
  role:
    usuario.rol === "client"
      ? "cliente"
      : usuario.rol ?? usuario.role,
  balance: Number(usuario.saldo ?? usuario.balance ?? 0),
  status: usuario.estado ?? usuario.status,
});

const normalizeCard = (tarjeta) => ({
  id: tarjeta.id,
  type: tarjeta.tipo,
  number: tarjeta.numero,
  holder: tarjeta.titular,
  expires: tarjeta.vencimiento,
  cvv: tarjeta.cvv,
  frozen: Boolean(tarjeta.congelada),
});

const normalizeContact = (contacto) => ({
  id: contacto.id,
  name: contacto.nombre,
  alias: contacto.alias,
  cbu: contacto.cbu,
  bank: contacto.banco,
  reference: contacto.referencia,
  isFavorite: Boolean(contacto.favorito),
});

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("novabank_token");

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw Object.assign(new Error(data.message || "Ocurrió un error."), {
      status: response.status,
    });
  }

  return data;
};

export function BankProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("novabank_users");

    if (saved) {
      return JSON.parse(saved);
    }

    return USERS.map((user) => {
      if (user.id === "cliente-1") {
        return {
          ...user,
          contacts: [
            {
              id: "contacto-1",
              name: "Martina Ruiz",
              alias: "martina.nova.bank",
              cbu: "0000003100098765432109",
              bank: "NovaBank",
              reference: "Martina facultad",
              isFavorite: true,
            },
          ],
        };
      }

      return {
        ...user,
        contacts: [],
      };
    });
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("novabank_transactions");
    return saved ? JSON.parse(saved) : TRANSACTIONS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("novabank_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("novabank_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(
      "novabank_transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        "novabank_current_user",
        JSON.stringify(currentUser)
      );
    } else {
      localStorage.removeItem("novabank_current_user");
    }
  }, [currentUser]);

  // ================= CUENTA REAL (perfil, saldo, tarjetas, contactos) =================

  const loadAccountData = async () => {
    try {
      const [perfilRes, tarjetasRes, contactosRes] = await Promise.all([
        apiFetch("/usuarios/me"),
        apiFetch("/tarjetas"),
        apiFetch("/contactos"),
      ]);

      const user = normalizeUser(perfilRes.usuario);
      user.cards = tarjetasRes.tarjetas.map(normalizeCard);
      user.contacts = contactosRes.contactos.map(normalizeContact);

      setCurrentUser(user);

      return true;
    } catch (error) {
      console.error("Error al cargar los datos de la cuenta:", error);

      if (error.status === 401) {
        logout();
      }

      return false;
    }
  };

  useEffect(() => {
    if (localStorage.getItem("novabank_token")) {
      loadAccountData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================= AUTENTICACIÓN =================

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          contrasena: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "No se pudo iniciar sesión.",
        };
      }

      const user = normalizeUser(data.usuario);

      localStorage.setItem("novabank_token", data.token);
      setCurrentUser(user);

      if (user.role === "cliente") {
        await loadAccountData();
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error("Error de login:", error);

      return {
        success: false,
        error: "No se pudo conectar con el servidor.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("novabank_token");
    localStorage.removeItem("novabank_current_user");
    setCurrentUser(null);
  };

  const register = async ({ name, email, dni, password }) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: name.trim(),
          email: email.toLowerCase().trim(),
          dni: dni.trim(),
          contrasena: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "No se pudo crear la cuenta.",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error de registro:", error);

      return {
        success: false,
        error: "No se pudo conectar con el servidor.",
      };
    }
  };

  const verifyPassword = async (password) => {
    try {
      const data = await apiFetch("/auth/verificar-password", {
        method: "POST",
        body: JSON.stringify({ contrasena: password }),
      });

      return Boolean(data.valido);
    } catch (error) {
      console.error("Error al verificar la contraseña:", error);
      return false;
    }
  };

  // ================= OPERACIONES BANCARIAS =================

  const resolveRecipient = async (query) => {
    try {
      const data = await apiFetch(
        `/usuarios/resolver?destino=${encodeURIComponent(query)}`
      );

      return data.destinatario;
    } catch (error) {
      return null;
    }
  };

  const transfer = async (destCbuOrAlias, amount, message = "") => {
    if (!currentUser) {
      return {
        success: false,
        error: "No hay un usuario autenticado.",
      };
    }

    try {
      const data = await apiFetch("/transacciones/transferencia", {
        method: "POST",
        body: JSON.stringify({
          destino: destCbuOrAlias.trim(),
          monto: Number(amount),
          mensaje: message.trim(),
        }),
      });

      await loadAccountData();

      return {
        success: true,
        recipient: data.destinatario,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "No se pudo realizar la transferencia.",
      };
    }
  };

  // ================= INVERSIONES =================

  const createInvestment = async (type, amount) => {
    if (!currentUser) {
      return {
        success: false,
        error: "No hay usuario activo.",
      };
    }

    try {
      await apiFetch("/transacciones/inversion", {
        method: "POST",
        body: JSON.stringify({ tipo: type, monto: Number(amount) }),
      });

      await loadAccountData();

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "No se pudo procesar la inversión.",
      };
    }
  };

  // ================= TARJETAS =================

  const createCard = async (type) => {
    try {
      await apiFetch("/tarjetas", {
        method: "POST",
        body: JSON.stringify({ tipo: type }),
      });

      await loadAccountData();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "No se pudo crear la tarjeta.",
      };
    }
  };

  const freezeCard = async (cardId) => {
    try {
      await apiFetch(`/tarjetas/${cardId}`, { method: "PATCH" });
      await loadAccountData();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "No se pudo actualizar la tarjeta.",
      };
    }
  };

  const deleteCard = async (cardId) => {
    try {
      await apiFetch(`/tarjetas/${cardId}`, { method: "DELETE" });
      await loadAccountData();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "No se pudo eliminar la tarjeta.",
      };
    }
  };

  // ================= CONTACTOS =================

  const addContact = async (contactData) => {
    if (!currentUser) {
      return { success: false, error: "No hay usuario activo." };
    }

    try {
      await apiFetch("/contactos", {
        method: "POST",
        body: JSON.stringify({
          nombre: contactData.name,
          alias: contactData.alias,
          cbu: contactData.cbu,
          banco: contactData.bank,
          referencia: contactData.reference,
        }),
      });

      await loadAccountData();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "No se pudo agregar el contacto.",
      };
    }
  };

  const removeContact = async (contactId) => {
    if (!currentUser) return;

    try {
      await apiFetch(`/contactos/${contactId}`, { method: "DELETE" });
      await loadAccountData();
    } catch (error) {
      console.error("Error al eliminar contacto:", error);
    }
  };

  const toggleFavoriteContact = async (contactId) => {
    if (!currentUser) return;

    const contact = (currentUser.contacts || []).find(
      (item) => item.id === contactId
    );

    if (!contact) return;

    try {
      await apiFetch(`/contactos/${contactId}`, {
        method: "PATCH",
        body: JSON.stringify({ favorito: !contact.isFavorite }),
      });
      await loadAccountData();
    } catch (error) {
      console.error("Error al actualizar contacto:", error);
    }
  };

  const updateContactReference = async (contactId, reference) => {
    if (!currentUser) return;

    try {
      await apiFetch(`/contactos/${contactId}`, {
        method: "PATCH",
        body: JSON.stringify({ referencia: reference }),
      });
      await loadAccountData();
    } catch (error) {
      console.error("Error al actualizar contacto:", error);
    }
  };

  // ================= PERFIL =================

  const updateUserProfile = (updatedData) => {
    if (!currentUser) return;

    setUsers((previousUsers) =>
      previousUsers.map((user) => {
        if (user.id !== currentUser.id) {
          return user;
        }

        const initials = updatedData.name
          ? updatedData.name
              .split(" ")
              .map((namePart) => namePart[0])
              .join("")
              .toUpperCase()
          : user.initials;

        return {
          ...user,
          ...updatedData,
          initials,
        };
      })
    );

    setCurrentUser((previousUser) => {
      if (!previousUser) return null;

      const initials = updatedData.name
        ? updatedData.name
            .split(" ")
            .map((namePart) => namePart[0])
            .join("")
            .toUpperCase()
        : previousUser.initials;

      return {
        ...previousUser,
        ...updatedData,
        initials,
      };
    });
  };

  return (
    <BankContext.Provider
      value={{
        currentUser,
        users,
        transactions,
        login,
        logout,
        register,
        verifyPassword,
        resolveRecipient,
        transfer,
        createInvestment,
        createCard,
        freezeCard,
        deleteCard,
        addContact,
        removeContact,
        toggleFavoriteContact,
        updateContactReference,
        updateUserProfile,
        setUsers,
      }}
    >
      {children}
    </BankContext.Provider>
  );
}

export const useBank = () => useContext(BankContext);
