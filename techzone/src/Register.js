import React, { useState } from "react";

export default function Register({ onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        onRegister(username);
      } else {
        const error = await response.json();
        alert(error.message || "Error al registrar");
      }
    } catch (err) {
      alert("Error al conectar con el servidor");
      console.error(err);
    }
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