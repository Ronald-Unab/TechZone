import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const savedUsers = JSON.parse(localStorage.getItem('users')) || [];

    // Si no hay usuarios registrados
    if (savedUsers.length === 0) {
      alert("No hay usuarios registrados. Por favor, regístrate primero.");
      return;
    }

    // Buscar coincidencia por nombre y contraseña
    const foundUser = savedUsers.find(u => u.username === username && u.password === password);

    if (foundUser) {
      localStorage.setItem('currentUser', username);
      onLogin(username);
    } else {
      alert("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
      <h3 className="text-lg font-semibold text-zinc-200 mb-2">Iniciar sesión</h3>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Usuario"
        className="block w-full mb-2 p-2 rounded bg-zinc-800 text-white"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        className="block w-full mb-2 p-2 rounded bg-zinc-800 text-white"
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
      >
        Entrar
      </button>
    </form>
  );
}