import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Button, Form, Dropdown } from "react-bootstrap";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import { getDailySales, getLowStock, getSalesBySeller, getInventoryMovements } from "../api/reports";
import { useRouter } from "next/router";

export default function ReportsPage() {
  const [daily, setDaily] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [salesBySeller, setSalesBySeller] = useState([]);
  const [movements, setMovements] = useState([]);
  const [range, setRange] = useState({ from: "", to: "" });

  const router = useRouter();
  const user = JSON.parse(localStorage.getItem("me") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    router.push("/login");
  };

  const fetchReports = async () => {
    try {
      const l = await getLowStock();
      setLowStock(l);
      const m = await getInventoryMovements(50, 0);
      setMovements(m);
      if (range.from && range.to) {
        const d = await getDailySales(range.from, range.to);
        setDaily(d);
        const s = await getSalesBySeller(range.from, range.to);
        setSalesBySeller(s);
      }
    } catch (err) {
      console.error(err);
      alert("Error cargando reportes");
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const applyRange = async (e) => {
    e.preventDefault();
    await fetchReports();
  };

  return (
    <ProtectedRoute>
      <div className="d-flex">
        <Sidebar />
        <Container className="mt-3">
          <Row className="align-items-center mb-3">
            <Col><h2>Reportes</h2></Col>
            <Col className="text-end">
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  className="shadow-sm d-flex align-items-center"
                  style={{ borderRadius: "30px", padding: "8px 14px" }}
                >
                  <img
                    src={user.image_url || "https://png.pngtree.com/element_our/20190528/ourmid/pngtree-no-photo-icon-image_1128432.jpg"}
                    alt={user.username}
                    style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", marginRight: 8 }}
                  />
                  <div className="text-start me-2" style={{ lineHeight: "1.1" }}>
                    <strong>{user.username || "Usuario"}</strong>
                    <div style={{ fontSize: "0.75rem", color: "#666" }}>Rol: {user.role}</div>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-sm">
                  <Dropdown.Item onClick={handleLogout} className="text-danger fw-semibold">
                    Cerrar sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          {/* ...existing UI: tarjetas y tablas de reportes... */}
          <Row className="mb-3">
            <Col md={6}>
              <Card className="mb-2">
                <Card.Body>
                  <Card.Title>Stock bajo</Card.Title>
                  <Table size="sm">
                    <thead><tr><th>ID</th><th>Producto</th><th>SKU</th><th>Qty</th></tr></thead>
                    <tbody>
                      {lowStock.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.name}</td><td>{p.sku}</td><td>{p.quantity}</td></tr>)}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-2">
                <Card.Body>
                  <Card.Title>Movimientos recientes</Card.Title>
                  <Table size="sm">
                    <thead><tr><th>Fecha</th><th>Producto</th><th>Cambio</th><th>Razón</th></tr></thead>
                    <tbody>
                      {movements.map(m => <tr key={m.id}><td>{new Date(m.created_at).toLocaleString()}</td><td>{m.product_name}</td><td>{m.quantity_change}</td><td>{m.reason}</td></tr>)}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ...resto del archivo unchanged... */}
        </Container>
      </div>
    </ProtectedRoute>
  );
}