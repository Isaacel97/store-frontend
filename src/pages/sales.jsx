import { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Form, Container, Row, Col, InputGroup, Dropdown } from "react-bootstrap";
import { BsSearch, BsArrowUp, BsArrowDown, BsPlusLg } from "react-icons/bs";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import { getSales, createSale, revertSale } from "../api/sales";
import { getProducts } from "../api/products";
import { useRouter } from "next/router";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([{ product_id: "", qty: 1 }]);
  const [sellerId, setSellerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const router = useRouter();
  const user = JSON.parse(localStorage.getItem("me") || "{}");

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
          {/* Search + User */}
          <Row className="align-items-center mb-3">
            <Col md={6}>
              <InputGroup className="rounded-pill overflow-hidden shadow-sm">
                <InputGroup.Text className="bg-white border-0">
                  <BsSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por id, vendedor o fecha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0"
                />
              </InputGroup>
            </Col>

            <Col md={6} className="text-end">
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
            <Table striped hover responsive className="m-0">
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
            </Table>
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
        </Container>
      </div>
    </ProtectedRoute>
  );
}