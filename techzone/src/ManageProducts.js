import React, { useState, useEffect } from "react";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ id: null, name: "", desc: "", price: "", image: "", file: null });
  const [editMode, setEditMode] = useState(false);

  // Cargar productos desde localStorage
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const saved = JSON.parse(localStorage.getItem("userProducts")) || [];
    const mine = saved.filter(p => p.owner === currentUser);
    setProducts(mine);
  }, []);

  // Guardar en localStorage
  const saveProducts = (updatedList) => {
    setProducts(updatedList);
    localStorage.setItem("userProducts", JSON.stringify(updatedList));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!form.name || !form.desc || !form.price || !form.file) {
      return alert("Todos los campos son obligatorios");
    }

    const currentUser = localStorage.getItem("currentUser");

    const newProduct = {
      id: Date.now(),
      name: form.name,
      desc: form.desc,
      price: parseFloat(form.price),
      image: form.file ? URL.createObjectURL(form.file) : "",
      owner: currentUser
    };

    const updatedList = [...products, newProduct];
    saveProducts(updatedList);
    setForm({ id: null, name: "", desc: "", price: "", file: null });
    setEditMode(false);
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditMode(true);
  };

  const handleUpdate = () => {
    const updatedList = products.map(p => p.id === form.id ? { ...form, price: parseFloat(form.price) } : p);
    saveProducts(updatedList);
    setForm({ id: null, name: "", desc: "", price: "", file: null });
    setEditMode(false);
  };

  const handleDelete = (id) => {
    const updatedList = products.filter(p => p.id !== id);
    saveProducts(updatedList);
  };

  return (
    <div className="p-6 bg-zinc-900 text-zinc-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-400 text-center">Administrar mis productos</h2>

      {/* Formulario */}
      <div className="bg-zinc-800 p-4 rounded-lg mb-8 max-w-xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Agregar / Editar producto</h3>
        <div className="grid gap-3">
          <input
            type="text"
            name="name"
            placeholder="Nombre del producto"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded bg-zinc-700 text-white"
          />
          <input
            type="text"
            name="desc"
            placeholder="Descripción"
            value={form.desc}
            onChange={handleChange}
            className="border p-2 rounded bg-zinc-700 text-white"
          />
          <input
            type="number"
            name="price"
            placeholder="Precio"
            value={form.price}
            onChange={handleChange}
            className="border p-2 rounded bg-zinc-700 text-white"
          />
          <input
            type="file"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            className="border p-2 rounded bg-zinc-700 text-white"
          />
          {editMode ? (
            <button onClick={handleUpdate} className="bg-yellow-500 text-black p-2 rounded font-bold">
              Guardar cambios
            </button>
          ) : (
            <button onClick={handleAdd} className="bg-blue-600 text-white p-2 rounded font-bold">
              Agregar producto
            </button>
          )}
        </div>
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <p className="text-center text-zinc-400 col-span-full">Aún no has agregado productos.</p>
        ) : (
          products.map(product => (
            <div key={product.id} className="border border-zinc-700 p-4 rounded bg-zinc-800 shadow">
              <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded mb-2" />
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-zinc-300">{product.desc}</p>
              <p className="font-bold text-green-400">${product.price}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="bg-yellow-500 text-black px-3 py-1 rounded text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}