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
    image: "/mouse.jpg"
  },
  {
    id: 2,
    name: "Teclado Mecánico",
    desc: "Switch azul, retroiluminado",
    price: 39.99,
    image: "/teclado.jpg"
  },
  {
    id: 3,
    name: "Headset Gamer",
    desc: "Sonido envolvente, micrófono",
    price: 29.99,
    image: "/headset.jpg"
  },
  {
    id: 4,
    name: "Monitor 24\" FHD",
    desc: "IPS, 75Hz, HDMI",
    price: 109.99,
    image: "/monitor.jpg"
  },
];

// Todos los productos del catálogo
const catalogProducts = [
  ...featuredProducts,
  {
    id: 5,
    name: "Memoria RAM 16GB DDR4",
    desc: "3200MHz, CL16",
    price: 47.99,
    image: "/ram.jpg"
  },
  {
    id: 6,
    name: "Disco SSD 1TB",
    desc: "NVMe Gen3, 3500MB/s",
    price: 59.99,
    image: "/ssd.jpg"
  },
  {
    id: 7,
    name: "Tarjeta de Video GTX 1660",
    desc: "6GB GDDR5",
    price: 210.99,
    image: "/gpu.jpg"
  },
  {
    id: 8,
    name: "Procesador Ryzen 5 5600G",
    desc: "6 núcleos, 12 hilos",
    price: 154.99,
    image: "/cpu.jpg"
  },
  {
    id: 9,
    name: "Fuente 650W 80+ Bronze",
    desc: "Alta eficiencia, silenciosa",
    price: 39.99,
    image: "/psu.jpg"
  },
  {
    id: 10,
    name: "Gabinete RGB",
    desc: "Ventiladores incluidos, lateral vidrio",
    price: 64.99,
    image: "/case.jpg"
  }
];

export default function App() {

  const [message, setMessage] = useState("");
  const [user, setUser] = useState(localStorage.getItem("currentUser"));
  const [view, setView] = useState(user ? "home" : "login");
  const [cart, setCart] = useState([]);
  const [userProducts, setUserProducts] = useState([]);


  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setUser(currentUser);
      const savedCart = JSON.parse(localStorage.getItem(`cart_${currentUser}`)) || [];
      setCart(savedCart);
      const savedProducts = JSON.parse(localStorage.getItem("userProducts")) || [];
      const othersProducts = savedProducts.filter(p => p.owner !== currentUser);
      setUserProducts(othersProducts);
    }
  }, []);

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
    const existing = cart.find(item => item.product.id === product.id);

    let updatedCart;
    if (existing) {
      updatedCart = cart.map(item => {
        if (item.product.id === product.id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
    } else {
      updatedCart = [...cart, { product, quantity: 1 }];
    }

    setCart(updatedCart);

    if (user) {
      localStorage.setItem(`cart_${user}`, JSON.stringify(updatedCart));
    }

    setMessage(`Producto "${product.name}" agregado al carrito.`);
    setTimeout(() => setMessage(""), 1800);
  }

  // Quitar del carrito
  function handleRemoveFromCart(id) {
    setCart(prev => prev.filter(item => item.product.id !== id));
  }

  // Cambiar cantidad en carrito
  function handleChangeQty(id, delta) {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const qty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: qty };
      }
      return item;
    }));
  }

  // Total carrito
  function cartTotal() {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2);
  }

  // Componente productos
  function ProductGrid({ products }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(prod => (
          <div key={prod.id} className="bg-zinc-900 rounded-2xl shadow p-4 flex flex-col items-center border border-zinc-800">
            <img src={prod.image} alt={prod.name} className="mb-4 rounded w-36 h-36 object-contain bg-zinc-800" />
            <h3 className="font-bold text-zinc-100">{prod.name}</h3>
            <p className="text-sm text-zinc-400">{prod.desc}</p>
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

  // Componente carrito
  function Cart() {
    if (cart.length === 0) {
      return <div className="text-zinc-400">El carrito está vacío.</div>;
    }
    return (
      <div className="max-w-xl mx-auto">
        <ul>
          {cart.map(item => (
            <li key={item.product.id} className="flex items-center justify-between bg-zinc-900 rounded-2xl shadow p-3 mb-4 border border-zinc-800">
              <div className="flex items-center gap-3">
                <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded object-contain bg-zinc-800" />
                <div>
                  <div className="font-bold text-zinc-100">{item.product.name}</div>
                  <div className="text-sm text-zinc-400">{item.product.desc}</div>
                  <div className="text-xs text-zinc-500">Precio: ${item.product.price}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => handleChangeQty(item.product.id, -1)}
                    className="px-2 py-1 bg-zinc-800 text-zinc-100 rounded font-bold">-</button>
                  <span className="px-2 text-zinc-200">{item.quantity}</span>
                  <button onClick={() => handleChangeQty(item.product.id, 1)}
                    className="px-2 py-1 bg-zinc-800 text-zinc-100 rounded font-bold">+</button>
                </div>
                <button onClick={() => handleRemoveFromCart(item.product.id)}
                  className="text-xs text-red-400 hover:underline">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="text-right font-semibold text-lg mt-4 text-zinc-200">Total: ${cartTotal()}</div>
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
                    <button
                      onClick={() => {
                        localStorage.removeItem("currentUser");
                        setUser(null);
                        setCart([]);
                        setView("login");
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
                    <ProductGrid products={[...catalogProducts, ...userProducts]} />
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
            {view === "manage" && (
              <section>
                {user ? (
                  <ManageProducts />
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