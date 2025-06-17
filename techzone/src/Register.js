import React, { useState } from "react";

export default function Register({ onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    // Cargar usuarios existentes
    const savedUsers = JSON.parse(localStorage.getItem('users')) || [];

    // Verificar si el usuario ya existe
    const exists = savedUsers.some(u => u.username === username);
    if (exists) {
      alert("El usuario ya está registrado. Intenta iniciar sesión.");
      return;
    }

    // Agregar nuevo usuario
    const newUser = { username, password };
    const updatedUsers = [...savedUsers, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', username);
    onRegister(username);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
      <h3 className="text-lg font-semibold text-zinc-200 mb-2">Registro de usuario</h3>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Nombre de usuario"
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
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
      >
        Registrarse
      </button>
    </form>
  );
}