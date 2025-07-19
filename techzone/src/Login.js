import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      if (response.ok) {
        onLogin(username);
      } else {
        const error = await response.json();
        alert(error.message || "Usuario o contraseña incorrectos");
      }
    } catch (err) {
      alert("Error al conectar con el servidor");
      console.error(err);
    }
  }

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