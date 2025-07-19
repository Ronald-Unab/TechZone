import React, { useState, useEffect } from "react";
import Register from "./Register";
import Login from "./Login";
import ManageProducts from "./ManageProducts";

// Productos destacados para la Home
const featuredProducts = [
  {
    id: 1,
    name: "Mouse Gamer",
    desc: "Sensor óptico, RGB, 12000 DPI",
    price: 24.99,
    image: "/mouse.jpg",
    category: "PC"
  },
  {
    id: 2,
    name: "Teclado Mecánico",
    desc: "Switch azul, retroiluminado",
    price: 39.99,
    image: "/teclado.jpg",
    category: "PC"
  },
  {
    id: 3,
    name: "Headset Gamer",
    desc: "Sonido envolvente, micrófono",
    price: 29.99,
    image: "/headset.jpg",
    category: "Accesorios"
  },
  {
    id: 4,
    name: "Monitor 24\" FHD",
    desc: "IPS, 75Hz, HDMI",
    price: 109.99,
    image: "/monitor.jpg",
    category: "PC"
  },
];

export default function App() {

  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [view, setView] = useState(user ? "home" : "login");
  const [cart, setCart] = useState([]);
  const [userProducts, setUserProducts] = useState([]); // productos de otros usuarios (para el catálogo)
  const [myProducts, setMyProducts] = useState([]);     // productos propios (para "Administrar")
  const [history, setHistory] = useState([]);
  const [archived, setArchived] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [productStockMap, setProductStockMap] = useState({});

  const refreshProducts = async () => {
    if (!user) return;
    const res = await fetch("http://localhost:5000/api/products");
    const data = await res.json();
    const mine = data.filter(p => p.owner === user);
    const others = data.filter(p => p.owner !== user);
    const stockMap = {};
    data.forEach(p => {
      stockMap[p._id] = p.stock;
    });
    setProductStockMap(stockMap);
    setMyProducts(mine);         // se usarán en "Administrar"
    setUserProducts(others);     // se mostrarán en el catálogo
  };

  useEffect(() => {
    // Verificar si hay sesión activa
    fetch("http://localhost:5000/api/users/me", {
      credentials: "include"
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.username) {
          setUser(data.username);
          setView("home");

          // 👇 Cargar productos una vez autenticado
          refreshProducts();

          // 👇 Cargar carrito
          fetch("http://localhost:5000/api/cart", {
            credentials: "include"
          })
            .then(res => res.json())
            .then(data => {
              if (data && data.items) {
                setCart(data.items.map(item => ({
                  product: item.product,
                  quantity: item.quantity
                })));
              }
            });

          fetch("http://localhost:5000/api/history", {
            credentials: "include"
          })
            .then(res => res.json())
            .then(data => setHistory(data));

          fetch("http://localhost:5000/api/history", { credentials: "include" })
            .then(res => res.json())
            .then(data => setHistory(data));

          fetch("http://localhost:5000/api/history/archived", { credentials: "include" })
            .then(res => res.json())
            .then(data => setArchived(data));

          fetch("http://localhost:5000/api/products/archived", { credentials: "include" })
            .then(res => res.json())
            .then(data => setArchivedProducts(data));

        } else {
          setUser(null);
          setView("login");
        }
      });
  }, [user]);

  // Navegación
  function handleNav(section) {
    if (!user && (section === "home" || section === "catalog" || section === "cart")) {
      setView("login");
    } else {
      setView(section);
    }
    setMessage("");
  }

  // Añadir al carrito
  function handleAddToCart(product) {
  const currentQtyInCart = cart.find(item => item.product._id === product._id)?.quantity || 0;
  const available = productStockMap[product._id] ?? product.stock ?? 0;

  // Validar si el producto ya no tiene stock desde el catálogo
  if (available === 0) {
    alert(`"${product.name}" ya no está disponible.`);
    return;
  }

  // Validar si ya se agregó la cantidad máxima permitida
  if (currentQtyInCart >= available) {
    alert(`Ya has agregado la cantidad máxima disponible de "${product.name}".`);
    return;
  }

  const updatedCart = [...cart];
  const index = updatedCart.findIndex(item => item.product._id === product._id);

  if (index !== -1) {
    updatedCart[index].quantity += 1;
  } else {
    updatedCart.push({ product, quantity: 1 });
  }

  setCart(updatedCart);

  // Actualizar stock local
  setProductStockMap(prev => ({
    ...prev,
    [product._id]: available - 1
  }));

  // Guardar en backend
  fetch("http://localhost:5000/api/cart", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: updatedCart.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }))
    })
  });

  setMessage(`Producto "${product.name}" agregado al carrito.`);
  setTimeout(() => setMessage(""), 1800);
}

  // Quitar del carrito
  function handleRemoveFromCart(id) {
    const removedItem = cart.find(item => item.product._id === id);
    const updated = cart.filter(item => item.product._id !== id);
    setCart(updated);

    if (removedItem) {
      setProductStockMap(prev => ({
        ...prev,
        [id]: (prev[id] || 0) + removedItem.quantity
      }));
    }

    fetch("http://localhost:5000/api/cart", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: updated.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }))
      })
    }).then(() => {
      fetch("http://localhost:5000/api/cart", {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.items) {
            setCart(
              data.items.map(item => ({
                product: item.product,
                quantity: item.quantity
              }))
            );
          }
        });
    });
  }

  // Cambiar cantidad en carrito
  function handleChangeQty(id, delta) {
    const updated = cart.map(item => {
      if (item.product._id === id) {
        const max = item.product.stock || 1; // Evitar pasar el stock
        const newQty = Math.max(1, Math.min(item.quantity + delta, max));
        return { ...item, quantity: newQty };
      }
      return item;
    });

    setCart(updated);

    // Guardar cambios en MongoDB
    fetch("http://localhost:5000/api/cart", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: updated.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }))
      })
    });
  }

  const handleArchive = async (id) => {
    const res = await fetch(`http://localhost:5000/api/history/archive/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: true }),
    });
    if (res.ok) {
      const updated = history.find(h => h._id === id);
      setHistory(history.filter(h => h._id !== id));
      setArchived([...archived, { ...updated, archived: true }]);
    }
  };

  const handleUnarchive = async (id) => {
    const res = await fetch(`http://localhost:5000/api/history/archive/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: false }),
    });
    if (res.ok) {
      const updated = archived.find(h => h._id === id);
      setArchived(archived.filter(h => h._id !== id));
      setHistory([...history, { ...updated, archived: false }]);
    }
  };

  const handleUnarchiveProduct = async (id) => {
    const res = await fetch(`http://localhost:5000/api/products/archive/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: false })
    });

    if (res.ok) {
      setArchivedProducts(archivedProducts.filter(p => p._id !== id));
      refreshProducts();
    }
  };

  // Total carrito
  function cartTotal() {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2);
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    try {
      // Guardar historial
      const res = await fetch("http://localhost:5000/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.product._id,
            name: item.product.name,
            image: item.product.image,
            price: item.product.price,
            quantity: item.quantity
          }))
        })
      });

      if (!res.ok) {
        throw new Error("Error al guardar el historial de compras");
      }

      // Vaciar carrito en el backend
      const clearRes = await fetch("http://localhost:5000/api/cart", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ items: [] })
      });

      if (!clearRes.ok) {
        throw new Error("Error al vaciar el carrito en el servidor");
      }

      // Recargar carrito desde MongoDB (ya vacío)
      const cartRes = await fetch("http://localhost:5000/api/cart", {
        credentials: "include"
      });

      const cartData = await cartRes.json();

      if (cartData && cartData.items) {
        setCart(
          cartData.items.map(item => ({
            product: item.product,
            quantity: item.quantity
          }))
        );
      } else {
        setCart([]); // por si no hay nada
      }

      setMessage("¡Compra finalizada!");
      setTimeout(() => setMessage(""), 1800);

    } catch (error) {
      console.error("Error al finalizar la compra:", error);
      alert("Ocurrió un error al finalizar la compra.");
    }
  }

  // Componente productos
  function ProductGrid({ products }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(prod => (
          <div key={prod._id || prod.id} className="bg-zinc-900 rounded-2xl shadow p-4 flex flex-col items-center border border-zinc-800">
            <img
              src={
                prod.image?.startsWith("http")
                  ? prod.image
                  : `http://localhost:5000/uploads/${prod.image}`
              }
              alt={prod.name}
              className="mb-4 rounded w-36 h-36 object-contain bg-zinc-800"
            />
            <h3 className="font-bold text-zinc-100">{prod.name}</h3>
            <p className="text-sm text-zinc-400">{prod.desc}</p>
            <p className="text-sm text-green-400">Disponible: {prod.stock ?? 0}</p>
            <span className="mt-2 text-lg font-semibold text-blue-400">${prod.price}</span>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
              onClick={() => handleAddToCart(prod)}>
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    );
  }

  function GroupedCatalog({ products }) {
    const grouped = {};

    products.forEach(prod => {
      if (!grouped[prod.category]) {
        grouped[prod.category] = [];
      }
      grouped[prod.category].push(prod);
    });

    return (
      <div className="space-y-10">
        {Object.keys(grouped).map(category => (
          <div key={category}>
            <h3 className="text-xl font-bold mb-4 text-zinc-100 border-b border-zinc-700 pb-2">{category}</h3>
            <ProductGrid products={grouped[category]} />
          </div>
        ))}
      </div>
    );
  }

  // Componente carrito
  function Cart() {
    if (cart.length === 0) {
      return <div className="text-zinc-400">El carrito está vacío.</div>;
    }
    return (
      <div className="max-w-xl mx-auto">
        <ul>
          {cart.map(item => (
            <li key={item.product._id || item.product.id} className="flex items-center justify-between bg-zinc-900 rounded-2xl shadow p-3 mb-4 border border-zinc-800">
              <div className="flex items-center gap-3">
                <img
                  src={
                    item.product.image?.startsWith("http")
                      ? item.product.image
                      : `http://localhost:5000/uploads/${item.product.image}`
                  }
                  alt={item.product.name}
                  className="w-14 h-14 rounded object-contain bg-zinc-800"
                />
                <div>
                  <div className="font-bold text-zinc-100">{item.product.name}</div>
                  <div className="text-sm text-zinc-400">{item.product.desc}</div>
                  <div className="text-xs text-zinc-500">Precio: ${item.product.price}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => handleChangeQty(item.product._id, -1)}
                    className="px-2 py-1 bg-zinc-800 text-zinc-100 rounded font-bold">-</button>
                  <span className="px-2 text-zinc-200">{item.quantity}</span>
                  <button onClick={() => handleChangeQty(item.product._id, 1)}
                    className="px-2 py-1 bg-zinc-800 text-zinc-100 rounded font-bold">+</button>
                </div>
                <button onClick={() => handleRemoveFromCart(item.product._id)}
                  className="text-xs text-red-400 hover:underline">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="text-right font-semibold text-lg mt-4 text-zinc-200">Total: ${cartTotal()}</div>
        <button
          onClick={handleCheckout}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
        >
          Finalizar compra
        </button>
      </div>
    );
  }

  function PurchaseHistory() {

    const handleReAddToCart = async (items) => {
      const updated = [...cart];

      for (const { productId, name, price, image, quantity } of items) {
        try {
          const res = await fetch(`http://localhost:5000/api/products/${productId}`);
          if (!res.ok) {
            alert(`El producto "${name}" ya no está disponible.`);
            continue;
          }

          const product = await res.json();
          const available = productStockMap[productId] || product.stock;

          if (available < quantity) {
            alert(`Ya no hay suficiente stock para "${name}".`);
            continue;
          }

          const existing = updated.find(item => item.product._id === productId);
          if (existing) {
            existing.quantity += quantity;
          } else {
            updated.push({
              product: { _id: productId, name, price, image },
              quantity
            });
          }

          // Descontar stock local
          setProductStockMap(prev => ({
            ...prev,
            [productId]: prev[productId] - quantity
          }));

        } catch (error) {
          console.error("Error verificando producto:", error);
          alert(`Ocurrió un error con el producto "${name}"`);
        }
      }

      setCart(updated);

      // Guardar en backend
      fetch("http://localhost:5000/api/cart", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updated.map(item => ({
            product: item.product._id,
            quantity: item.quantity
          }))
        })
      });

      setMessage("Productos disponibles agregados al carrito.");
      setTimeout(() => setMessage(""), 1800);
    };

    return (
      <div className="max-w-3xl mx-auto text-zinc-200">
        <h2 className="text-xl font-bold mb-4">Historial de compras</h2>
        {history.length === 0 ? (
          <p className="text-zinc-400">No hay compras previas.</p>
        ) : (
          <>
            <ul className="space-y-6">
              {history.map((order, index) => {
                const total = order.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );

                return (
                  <li key={order._id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <h4 className="font-semibold text-lg mb-4">
                      Compra #{order.orderNumber}{" "}
                      <span className="text-sm text-zinc-400">
                        ({new Date(order.createdAt).toLocaleString()})
                      </span>
                    </h4>
                    <table className="w-full text-sm text-zinc-300 mb-3">
                      <thead className="border-b border-zinc-700 text-left">
                        <tr>
                          <th>Producto</th>
                          <th>Cant.</th>
                          <th>Unitario</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 pr-4 flex items-center gap-3">
                              <img
                                src={
                                  item.image?.startsWith("http")
                                    ? item.image
                                    : `http://localhost:5000/uploads/${item.image}`
                                }
                                alt={item.name}
                                className="w-10 h-10 object-contain rounded bg-zinc-800"
                              />
                              {item.name}
                            </td>
                            <td className="py-2 pr-4">{item.quantity}</td>
                            <td className="py-2 pr-4">${item.price.toFixed(2)}</td>
                            <td className="py-2">${(item.quantity * item.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-right text-lg font-semibold text-green-400">
                      Total: ${total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleReAddToCart(order.items)}
                      className="mt-3 bg-blue-600 px-3 py-1 text-sm rounded text-white"
                    >
                      Volver a agregar al carrito
                    </button>
                    <li key={order._id}>
                      <button
                        onClick={() => handleArchive(order._id)}
                        className="mt-2 bg-zinc-700 text-white px-3 py-1 text-sm rounded hover:bg-zinc-600 ml-2"
                      >
                        Archivar
                      </button>
                    </li>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    );
  }

  function ArchivedHistory() {
    return (
      <div className="max-w-3xl mx-auto text-zinc-200 space-y-12">
        {/* Productos archivados */}
        <div>
          <h2 className="text-xl font-bold mb-4">Productos archivados</h2>
          {archivedProducts.length === 0 ? (
            <p className="text-zinc-400">No tienes productos archivados.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {archivedProducts.map(product => (
                <li key={product._id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <img
                    src={`http://localhost:5000/uploads/${product.image}`}
                    alt={product.name}
                    className="w-full h-32 object-contain rounded bg-zinc-800 mb-3"
                  />
                  <h4 className="font-semibold text-lg">{product.name}</h4>
                  <p className="text-sm text-zinc-400">{product.desc}</p>
                  <div className="text-green-400 font-semibold mt-2">${product.price}</div>
                  <button
                    onClick={() => handleUnarchiveProduct(product._id)}
                    className="mt-3 bg-blue-600 text-white px-3 py-1 text-sm rounded"
                  >
                    Desarchivar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pedidos archivados */}
        <div>
          <h2 className="text-xl font-bold mb-4">Pedidos archivados</h2>
          {archived.length === 0 ? (
            <p className="text-zinc-400">No hay pedidos archivados.</p>
          ) : (
            <ul className="space-y-6">
              {archived.map((order, index) => {
                const total = order.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );

                return (
                  <li key={order._id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <h4 className="font-semibold text-lg mb-4">
                      Compra #{order.orderNumber}{" "}
                      <span className="text-sm text-zinc-400">
                        ({new Date(order.createdAt).toLocaleString()})
                      </span>
                    </h4>
                    <table className="w-full text-sm text-zinc-300 mb-3">
                      <thead className="border-b border-zinc-700 text-left">
                        <tr>
                          <th>Producto</th>
                          <th>Cant.</th>
                          <th>Unitario</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 pr-4 flex items-center gap-3">
                              <img
                                src={
                                  item.image?.startsWith("http")
                                    ? item.image
                                    : `http://localhost:5000/uploads/${item.image}`
                                }
                                alt={item.name}
                                className="w-10 h-10 object-contain rounded bg-zinc-800"
                              />
                              {item.name}
                            </td>
                            <td className="py-2 pr-4">{item.quantity}</td>
                            <td className="py-2 pr-4">${item.price.toFixed(2)}</td>
                            <td className="py-2">${(item.quantity * item.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-right text-lg font-semibold text-green-400">
                      Total: ${total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleUnarchive(order._id)}
                      className="mt-2 bg-blue-600 px-3 py-1 text-sm rounded text-white"
                    >
                      Desarchivar
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  function Checkout() {
    const total = cartTotal();

    return (
      <div className="max-w-2xl mx-auto text-zinc-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">Resumen del Pedido</h2>
        <ul className="mb-6">
          {cart.map(item => (
            <li key={item.product.id} className="flex justify-between items-center border-b border-zinc-700 py-2">
              <span>{item.product.name} (x{item.quantity})</span>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="text-right font-semibold text-lg mb-6">Total: ${total}</div>
        <button
          onClick={() => {
            setCart([]);
            setMessage("¡Gracias por tu compra!");
            setView("home");
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition"
        >
          Confirmar compra
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 text-zinc-100 p-4 shadow border-b border-zinc-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold cursor-pointer text-blue-400" onClick={() => handleNav("home")}>TechZone</h1>
          <nav>
            <ul className="flex gap-6 items-center">
              <li>
                <button onClick={() => handleNav("home")}
                  className={`hover:underline ${view === "home" ? "font-bold underline" : ""}`}>Inicio</button>
              </li>
              {user && (
                <>
                  <li>
                    <button onClick={() => handleNav("manage")}
                      className={`hover:underline ${view === "manage" ? "font-bold underline" : ""}`}>
                      Administrar
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNav("catalog")}
                      className={`hover:underline ${view === "catalog" ? "font-bold underline" : ""}`}>Catálogo</button>
                  </li>
                  <li>
                    <button onClick={() => handleNav("cart")}
                      className={`hover:underline ${view === "cart" ? "font-bold underline" : ""}`}>
                      Carrito ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNav("history")}
                      className={`hover:underline ${view === "history" ? "font-bold underline" : ""}`}>
                      Historial
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNav("archived")}
                      className={`hover:underline ${view === "archived" ? "font-bold underline" : ""}`}>
                      Archivados
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={async () => {
                        try {
                          await fetch("http://localhost:5000/api/users/logout", {
                            method: "POST",
                            credentials: "include",
                          });

                          setUser(null);
                          setCart([]);
                          setView("login");
                        } catch (error) {
                          console.error("Error al cerrar sesión:", error);
                        }
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto mt-8 px-2">
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-blue-900/60 text-blue-300 text-center border border-blue-800">
            {message}
          </div>
        )}
        {!user ? (
          <>
            {view === "login" && (
              <div className="max-w-md mx-auto text-zinc-300">
                <Login onLogin={(username) => { setUser(username); setView("home"); }} />
                <p className="text-sm text-center mt-4">
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={() => setView("register")}
                    className="text-blue-400 underline"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>
            )}
            {view === "register" && (
              <div className="max-w-md mx-auto text-zinc-300">
                <Register onRegister={(username) => { setUser(username); setView("home"); }} />
                <p className="text-sm text-center mt-4">
                  ¿Ya estás registrado?{" "}
                  <button
                    onClick={() => setView("login")}
                    className="text-blue-400 underline"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {view === "home" && (
              <section className="mb-12">
                <h2 className="text-xl font-semibold mb-2 text-zinc-200">Productos destacados</h2>
                <ProductGrid products={featuredProducts} />
              </section>
            )}
            {view === "catalog" && (
              <section>
                {user ? (
                  <>
                    <h2 className="text-xl font-semibold mb-2 text-zinc-200">Catálogo completo</h2>
                    <GroupedCatalog products={userProducts} />
                  </>
                ) : (
                  <p className="text-red-500">Debes iniciar sesión para ver el catálogo.</p>
                )}
              </section>
            )}
            {view === "cart" && (
              <section>
                {user ? (
                  <>
                    <h2 className="text-xl font-semibold mb-2 text-zinc-200">Carrito de compras</h2>
                    <Cart />
                  </>
                ) : (
                  <p className="text-red-500">Debes iniciar sesión para ver el carrito.</p>
                )}
              </section>
            )}
            {view === "checkout" && (
              <section>
                <Checkout />
              </section>
            )}
            {view === "history" && (
              <section>
                <PurchaseHistory />
              </section>
            )}
            {view === "archived" && (
              <section>
                <ArchivedHistory />
              </section>
            )}
            {view === "manage" && (
              <section>
                {user ? (
                  <ManageProducts myProducts={myProducts} refreshProducts={refreshProducts} user={user} />
                ) : (
                  <p className="text-red-500">Debes iniciar sesión para acceder a esta sección.</p>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <footer className="bg-zinc-900 text-zinc-400 py-6 mt-12 border-t border-zinc-800">
        <div className="container mx-auto text-center">
          &copy; 2025 TechZone. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}