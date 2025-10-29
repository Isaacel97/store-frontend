"use client";
import { Nav } from "react-bootstrap";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaCashRegister,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    router.push("/login");
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/products", label: "Productos", icon: <FaBoxOpen /> },
    { path: "/sales", label: "Ventas", icon: <FaCashRegister /> },
    { path: "/employees", label: "Empleados", icon: <FaUsers /> },
    { path: "/reports", label: "Reportes", icon: <FaChartBar /> },
  ];

  return (
    <div
      className="d-flex flex-column justify-content-between p-3 shadow-sm bg-white border-end"
      style={{ width: "230px", minHeight: "100vh" }}
    >
      {/* Encabezado */}
      <div>
        <div className="mb-4 text-center">
          <h4 className="fw-bold text-primary mb-0">StoreApp</h4>
          <hr className="mt-2" />
        </div>

        {/* Navegación */}
        <Nav className="flex-column">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Nav.Item key={item.path} className="mb-2">
                <Link
                  href={item.path}
                  className={`d-flex align-items-center gap-2 nav-link rounded px-3 py-2 ${
                    isActive ? "bg-primary text-white fw-semibold" : "text-dark"
                  }`}
                  style={{
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    className="fs-5"
                    style={{ opacity: isActive ? 1 : 0.7 }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </Nav.Item>
            );
          })}
        </Nav>
      </div>

      {/* Botón de Cerrar Sesión */}
      <div className="text-center mt-4">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
