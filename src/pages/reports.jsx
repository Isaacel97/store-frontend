import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import { getDailySales, getLowStock, getSalesBySeller, getInventoryMovements } from "../api/reports";
import { useRouter } from "next/router";
import { ProtectedRoute, Sidebar, ToastComponent, UserMenu } from "@/components";

export default function ReportsPage() {
  const [daily, setDaily] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [salesBySeller, setSalesBySeller] = useState([]);
  const [movements, setMovements] = useState([]);
  const [range, setRange] = useState({ from: "", to: "" });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const router = useRouter();
  const [user, setUser] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("me") || "{}");
    setUser(storedUser);
  }, []);

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
      setToast({
        show: true,
        message: "Error cargando reportes",
        type: "error",
      });
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
              <UserMenu user={user} onLogout={handleLogout} />
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

          <ToastComponent
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        </Container>
      </div>
    </ProtectedRoute>
  );
}