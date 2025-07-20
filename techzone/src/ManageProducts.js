import { useState } from "react";

export default function ManageProducts({ myProducts, refreshProducts, user, setArchivedProducts }) {
  const [form, setForm] = useState({
    _id: null,
    name: "",
    desc: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    file: null
  });
  const [editMode, setEditMode] = useState(false); // ✅ Declarado correctamente

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.desc || !form.price || !form.stock || !form.file || !form.category) {
      return alert("Todos los campos son obligatorios");
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("desc", form.desc);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("stock", form.stock);
    formData.append("image", form.file);
    formData.append("owner", user); // 🔄 Sustituido localStorage por prop

    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (response.ok) {
        alert("✅ Producto agregado con éxito");
        setForm({
          _id: null,
          name: "",
          desc: "",
          price: "",
          category: "",
          stock: "",
          image: "",
          file: null
        });
        refreshProducts();
      } else {
        const error = await response.json();
        console.error("❌ Error del servidor:", error);
        alert("❌ Error al guardar producto");
      }
    } catch (error) {
      console.error("❌ Error al guardar:", error);
    }
  };

  const handleEdit = (product) => {
    setForm({
      _id: product._id,
      name: product.name,
      desc: product.desc,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image,
      file: null
    });
    setEditMode(true);
  };

  const handleUpdate = async () => {
    if (!form.name || !form.desc || !form.price || !form.category || !form.stock) {
      return alert("Todos los campos son obligatorios");
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("desc", form.desc);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("stock", form.stock);
    if (form.file) {
      formData.append("image", form.file);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${form._id}`, {
        method: "PUT",
        body: formData,
        credentials: "include"
      });

      if (response.ok) {
        alert("✏️ Producto actualizado correctamente");
        setForm({
          _id: null,
          name: "",
          desc: "",
          price: "",
          category: "",
          stock: "",
          image: "",
          file: null
        });
        setEditMode(false);
        refreshProducts();
      } else {
        alert("❌ Error al actualizar producto");
      }
    } catch (error) {
      console.error("❌ Error al actualizar:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok) {
        alert("🗑️ Producto eliminado");
        refreshProducts();
      } else {
        alert("❌ No se pudo eliminar");
      }
    } catch (error) {
      console.error("❌ Error al eliminar:", error);
    }
  };

  const handleArchiveToggle = async (id, archive) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/archive/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ archived: archive })
      });

      if (res.ok) {
        refreshProducts();
      } else {
        alert("❌ No se pudo actualizar el estado del producto");
      }
    } catch (error) {
      console.error("❌ Error al archivar/desarchivar producto:", error);
    }
  };

  return (
    <div className="p-6 bg-zinc-900 text-zinc-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-400 text-center">Administrar mis productos</h2>

      {/* Formulario */}
      <div className="bg-zinc-800 p-4 rounded-lg mb-8 max-w-xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Agregar / Editar producto</h3>
        <form onSubmit={(e) => (editMode ? handleUpdate(e) : handleSubmit(e))} className="grid gap-3">

          <input
            type="text"
            name="name"
            placeholder="Nombre del producto"
            value={form.name}
            onChange={handleChange}
            className="border border-zinc-700 bg-zinc-800 text-white p-2 rounded w-full placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="desc"
            placeholder="Descripción"
            value={form.desc}
            onChange={handleChange}
            className="border border-zinc-700 bg-zinc-800 text-white p-2 rounded w-full placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="category"
            value={form.category || ""}
            onChange={handleChange}
            className="border border-zinc-700 bg-zinc-800 text-white p-2 rounded w-full placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona una categoría</option>
            <option value="PC">PC</option>
            <option value="Consolas">Consolas</option>
            <option value="Accesorios">Accesorios</option>
            <option value="Móviles">Móviles</option>
          </select>
          <input
            type="number"
            name="price"
            min="0"
            placeholder="Precio"
            value={form.price}
            onChange={handleChange}
            className="border border-zinc-700 bg-zinc-800 text-white p-2 rounded w-full placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="stock"
            min="0"
            placeholder="Cantidad disponible"
            value={form.stock}
            onChange={handleChange}
            className="border border-zinc-700 bg-zinc-800 text-white p-2 rounded w-full placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {form.image && (
            <div className="mb-2">
              <p className="text-sm text-zinc-400 mb-1">Imagen actual:</p>
              <img
                src={`http://localhost:5000/uploads/${form.image}`}
                alt="Imagen actual"
                className="h-20 object-contain rounded"
              />
            </div>
          )}
          <input
            type="file"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            className="border border-zinc-700 bg-zinc-800 text-white p-2 rounded w-full placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className={`${editMode ? "bg-yellow-500 text-black" : "bg-blue-600 text-white"} p-2 rounded font-bold`}
          >
            {editMode ? "Guardar cambios" : "Agregar producto"}
          </button>
        </form>
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {myProducts.length === 0 ? (
          <p className="text-center text-zinc-400 col-span-full">Aún no has agregado productos.</p>
        ) : (
          myProducts.filter(p => !p.archived).map(product => (
            <div key={product._id} className="border border-zinc-700 p-4 rounded bg-zinc-800 shadow">
              <img
                src={`http://localhost:5000/uploads/${product.image}`}
                alt={product.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-zinc-300">{product.desc}</p>
              <p className="text-sm text-green-400 mt-1">Disponible: {product.stock ?? 0}</p>
              <p className="font-bold text-green-400">${product.price}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="bg-yellow-500 text-black px-3 py-1 rounded text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => handleArchiveToggle(product._id, true)}
                  className="bg-zinc-600 text-white px-3 py-1 rounded text-sm"
                >
                  Archivar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}