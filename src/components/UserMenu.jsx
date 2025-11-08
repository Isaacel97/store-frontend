import { Dropdown } from "react-bootstrap";
import { useRouter } from "next/router";

const DEFAULT_AVATAR = "https://png.pngtree.com/element_our/20190528/ourmid/pngtree-no-photo-icon-image_1128432.jpg";

export default function UserMenu({ user = {}, onLogout }) {
  const router = useRouter();
  const logout = onLogout || (() => {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    router.push("/login");
  });

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="light"
        className="shadow-sm d-flex align-items-center"
        style={{ borderRadius: "30px", padding: "8px 14px" }}
      >
        <img
          src={user.image_url || DEFAULT_AVATAR}
          alt={user.username}
          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", marginRight: 8 }}
        />
        <div className="text-start me-2" style={{ lineHeight: "1.1" }}>
          <strong>{user.username || "Usuario"}</strong>
          <div style={{ fontSize: "0.75rem", color: "#666" }}>Rol: {user.role}</div>
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow-sm">
        <Dropdown.Item onClick={logout} className="text-danger fw-semibold">
          Cerrar sesión
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}