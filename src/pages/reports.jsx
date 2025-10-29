import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Button, Form } from "react-bootstrap";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import { getDailySales, getLowStock, getSalesBySeller, getInventoryMovements } from "../api/reports";

export default function ReportsPage() {
  const [daily, setDaily] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [salesBySeller, setSalesBySeller] = useState([]);
  const [movements, setMovements] = useState([]);
  const [range, setRange] = useState({ from: "", to: "" });

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
          <h2>Reportes</h2>

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

          <Card className="mb-3 p-3">
            <Form onSubmit={applyRange} className="d-flex gap-2 align-items-end">
              <Form.Group>
                <Form.Label>From</Form.Label>
                <Form.Control type="date" value={range.from} onChange={e => setRange({ ...range, from: e.target.value })} />
              </Form.Group>
              <Form.Group>
                <Form.Label>To</Form.Label>
                <Form.Control type="date" value={range.to} onChange={e => setRange({ ...range, to: e.target.value })} />
              </Form.Group>
              <div>
                <Button type="submit">Aplicar</Button>
              </div>
            </Form>
          </Card>

          {daily.length > 0 && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Ventas diarias</Card.Title>
                <Table size="sm">
                  <thead><tr><th>Fecha</th><th>Total Ventas</th><th>Pedidos</th></tr></thead>
                  <tbody>
                    {daily.map(d => <tr key={d.date}><td>{d.date}</td><td>{Number(d.total_sales).toFixed(2)}</td><td>{d.total_orders}</td></tr>)}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {salesBySeller.length > 0 && (
            <Card>
              <Card.Body>
                <Card.Title>Ventas por vendedor</Card.Title>
                <Table size="sm">
                  <thead><tr><th>Vendedor</th><th>Pedidos</th><th>Total</th></tr></thead>
                  <tbody>
                    {salesBySeller.map(s => <tr key={s.seller_id}><td>{s.full_name}</td><td>{s.total_sales}</td><td>{Number(s.total_amount).toFixed(2)}</td></tr>)}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

        </Container>
      </div>
    </ProtectedRoute>
  );
}
