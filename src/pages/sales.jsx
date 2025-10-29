import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Container, Row, Col, InputGroup } from "react-bootstrap";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import { getSales, createSale, revertSale } from "../api/sales";
import { getProducts } from "../api/products";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([{ product_id: "", qty: 1 }]);
  const [sellerId, setSellerId] = useState(null);

  const fetchAll = async () => {
    try {
      const s = await getSales();
      setSales(s);
      const p = await getProducts();
      setProducts(p);
    } catch (err) {
      console.error(err);
      alert("Error cargando ventas/productos");
    }
  };

  useEffect(() => {
    const me = JSON.parse(localStorage.getItem("me") || "null");
    if (me) setSellerId(me.id);
    fetchAll();
  }, []);

  const addItem = () => setItems(prev => [...prev, { product_id: "", qty: 1 }]);
  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index));
  const updateItem = (index, key, value) => setItems(prev => prev.map((it, i) => i === index ? { ...it, [key]: value } : it));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // map items to include price from product
      const enriched = items.map(it => {
        const prod = products.find(p => p.id === Number(it.product_id));
        return { product_id: Number(it.product_id), qty: Number(it.qty), price: prod ? Number(prod.price) : 0 };
      });
      const payload = { seller_id: sellerId, items: enriched };
      await createSale(payload);
      setShowModal(false);
      setItems([{ product_id: "", qty: 1 }]);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error creando venta");
    }
  };

  const handleRevert = async (saleId) => {
    if (!confirm("Revertir esta venta?")) return;
    try {
      await revertSale(saleId);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error al revertir");
    }
  };

  return (
    <ProtectedRoute>
      <div className="d-flex">
        <Sidebar />
        <Container className="mt-3">
          <Row>
            <Col><h2>Ventas</h2></Col>
            <Col className="text-end"><Button onClick={() => setShowModal(true)}>Nueva Venta</Button></Col>
          </Row>

          <Table striped bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>ID</th><th>Vendedor</th><th>Total</th><th>Fecha</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.seller_name || s.seller_id}</td>
                  <td>{Number(s.total).toFixed(2)}</td>
                  <td>{new Date(s.sale_time).toLocaleString()}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleRevert(s.id)}>Revertir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton><Modal.Title>Nueva Venta</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleCreate}>
                {items.map((it, idx) => (
                  <Row className="mb-2" key={idx}>
                    <Col md={7}>
                      <Form.Select value={it.product_id} onChange={e => updateItem(idx, "product_id", e.target.value)} required>
                        <option value="">Selecciona producto</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Control type="number" min="1" value={it.qty} onChange={e => updateItem(idx, "qty", e.target.value)} required />
                    </Col>
                    <Col md={2}>
                      <Button variant="danger" onClick={() => removeItem(idx)}>Eliminar</Button>
                    </Col>
                  </Row>
                ))}

                <div className="mb-3">
                  <Button variant="secondary" onClick={addItem}>Agregar Item</Button>
                </div>

                <div className="text-end">
                  <Button type="submit">Confirmar Venta</Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

        </Container>
      </div>
    </ProtectedRoute>
  );
}
