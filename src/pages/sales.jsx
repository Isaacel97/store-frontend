import { useEffect, useState, useMemo } from "react";
import { Button, Modal, Form, Container, Row, Col } from "react-bootstrap";
import { BsArrowUp, BsArrowDown, BsPlusLg } from "react-icons/bs";
import { getSales, createSale, revertSale } from "../api/sales";
import { getProducts } from "../api/products";
import { useRouter } from "next/router";
import {ProtectedRoute, Sidebar, ToastComponent, PanelContainer, Header} from "@/components";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([{ product_id: "", qty: 1 }]);
  const [sellerId, setSellerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const router = useRouter();
  const [user, setUser] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const fetchAll = async () => {
    try {
      const s = await getSales();
      setSales(s);
      const p = await getProducts();
      setProducts(p);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: "Error cargando ventas/productos", type: "error" });
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("me") || "{}");
    setUser(storedUser);
    const me = JSON.parse(localStorage.getItem("me") || "null");
    if (me) setSellerId(me.id);
    fetchAll();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    router.push("/login");
  };

  const addItem = () => setItems(prev => [...prev, { product_id: "", qty: 1 }]);
  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index));
  const updateItem = (index, key, value) => setItems(prev => prev.map((it, i) => i === index ? { ...it, [key]: value } : it));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
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
      setToast({ show: true, message: err.response?.data?.error || "Error creando venta", type: "error" });
    }
  };

  const handleRevert = async (saleId) => {
    if (!confirm("Revertir esta venta?")) return;
    try {
      await revertSale(saleId);
      fetchAll();
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: err.response?.data?.error || "Error al revertir", type: "error" });
    }
  };

  // Filtrado
  const filteredSales = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sales;
    return sales.filter(s =>
      String(s.id).includes(term) ||
      (s.seller_name || String(s.seller_id || "")).toLowerCase().includes(term) ||
      new Date(s.sale_time).toLocaleString().toLowerCase().includes(term)
    );
  }, [sales, searchTerm]);

  // Ordenamiento
  const sortedSales = useMemo(() => {
    if (!sortConfig.key) return filteredSales;
    return [...filteredSales].sort((a, b) => {
      const key = sortConfig.key;
      let aVal = a[key];
      let bVal = b[key];

      if (key === "total") {
        aVal = Number(a.total || 0);
        bVal = Number(b.total || 0);
      } else if (key === "sale_time") {
        aVal = new Date(a.sale_time).getTime();
        bVal = new Date(b.sale_time).getTime();
      } else {
        aVal = String(aVal || "");
        bVal = String(bVal || "");
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredSales, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <BsArrowUp /> : <BsArrowDown />;
  };

  return (
    <ProtectedRoute>
      <div className="d-flex">
        <Sidebar />
        <Container className="mt-3">
          <Header
            searchValue={searchTerm}
            onSearch={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por id, vendedor o fecha..."
            user={user}
            onLogout={handleLogout}
          />

          {/* Title + New Sale */}
          <Row className="align-items-center mb-3">
            <Col><h2 className="fw-bold text-primary">Ventas</h2></Col>
            <Col className="text-end">
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <BsPlusLg className="me-1" /> Nueva Venta
              </Button>
            </Col>
          </Row>

          {/* Tabla armonizada */}
          <div className="rounded-4 overflow-hidden shadow-sm">
            <PanelContainer>
              <thead className="table-light">
                <tr>
                  <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                    ID {renderSortIcon("id")}
                  </th>
                  <th onClick={() => handleSort("seller_name")} style={{ cursor: "pointer" }}>
                    Vendedor {renderSortIcon("seller_name")}
                  </th>
                  <th onClick={() => handleSort("total")} style={{ cursor: "pointer" }}>
                    Total {renderSortIcon("total")}
                  </th>
                  <th onClick={() => handleSort("sale_time")} style={{ cursor: "pointer" }}>
                    Fecha {renderSortIcon("sale_time")}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedSales.length > 0 ? (
                  sortedSales.map(s => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.seller_name || s.seller_id}</td>
                      <td>{Number(s.total).toFixed(2)}</td>
                      <td>{new Date(s.sale_time).toLocaleString()}</td>
                      <td>
                        <Button variant="danger" size="sm" onClick={() => handleRevert(s.id)}>Revertir</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-3">No se encontraron ventas</td>
                  </tr>
                )}
              </tbody>
            </PanelContainer>
          </div>

          {/* Modal Nueva Venta */}
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

          {/* Toasts */}
          <ToastComponent
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
          />
        </Container>
      </div>
    </ProtectedRoute>
  );
}