import { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Form, Container, Row, Col, Dropdown, InputGroup } from "react-bootstrap";
import { BsThreeDotsVertical, BsSearch, BsArrowUp, BsArrowDown, BsPlusLg } from "react-icons/bs";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import { getProducts, createProduct, updateProduct, deleteProduct, getInventory, adjustStock } from "../api/products";
import { useRouter } from "next/router";

export default function ProductsPage() {
  const INITIAL_FORM = { sku: "", name: "", price: 0, type: "", status: "active", initial_stock: 0, image_url: "" };
  const DEFAULT_IMAGE = "https://png.pngtree.com/element_our/20190528/ourmid/pngtree-no-photo-icon-image_1128432.jpg";
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockData, setStockData] = useState({ quantity_change: 0, reason: "" });
  const router = useRouter();
  const user = JSON.parse(localStorage.getItem("me") || "{}");
  console.log("Logged user:", user);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    router.push("/login");
  };

  const fetchAll = async () => {
    try {
      const p = await getProducts();
      setProducts(p);
      const inv = await getInventory();
      setInventory(inv);
    } catch (err) {
      console.error(err);
      alert("Error cargando productos");
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const stockMap = useMemo(
    () => Object.fromEntries(inventory.map(item => [item.product_id, item.quantity])),
    [inventory]
  );

  const findStock = (id) => stockMap[id] ?? 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      initial_stock: parseInt(formData.initial_stock) || 0,
    };

    try {
      editProduct
        ? await updateProduct(editProduct.id, dataToSend)
        : await createProduct(dataToSend);
      setShowModal(false);
      setEditProduct(null);
      setFormData(INITIAL_FORM);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error guardando producto");
    }
  };

  const handleEdit = (p) => {
    setEditProduct(p);
    setFormData({...p, image_url: p.image_url || DEFAULT_IMAGE });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      await deleteProduct(id);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  };

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
  }, [products, searchTerm]);


  // Ordenamiento de columnas
  const sortedProducts = useMemo(() => {
    if (!sortConfig.key) return filteredProducts;
    return [...filteredProducts].sort((a, b) => {
      const aVal = sortConfig.key === "stock" ? findStock(a.id) : a[sortConfig.key];
      const bVal = sortConfig.key === "stock" ? findStock(b.id) : b[sortConfig.key];
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredProducts, sortConfig, inventory]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleStock = (p) => {
    setStockProduct(p);
    setStockData({ quantity_change: 0, reason: "" });
    setShowStockModal(true);
  };

  const submitStock = async (e) => {
    e.preventDefault();
    try {
      await adjustStock(stockProduct.id, Number(stockData.quantity_change), stockData.reason, 1);
      setShowStockModal(false);
      fetchAll();
    } catch {
      alert("Error ajustando stock");
    }
  };


  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <BsArrowUp /> : <BsArrowDown />;
  };

  const renderStatusBadge = (status) => {
    const isActive = status === "active";
    return (
      <span
        style={{
          display: "inline-block",
          padding: "6px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "0.85rem",
          color: "white",
          backgroundColor: isActive ? "#28a745" : "#dc3545", // Verde o rojo
          textTransform: "capitalize"
        }}
      >
        {isActive ? "Activo" : "Inactivo"}
      </span>
    );
  };

  return (
    <ProtectedRoute>
      <div className="d-flex">
        <Sidebar />
        <Container className="mt-3">
          {/* Search */}
          <Row className="align-items-center mb-3">
            <Col md={6}>
              <InputGroup className="rounded-pill overflow-hidden shadow-sm">
                <InputGroup.Text className="bg-white border-0">
                  <BsSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0"
                />
              </InputGroup>
            </Col>

            {/* Perfil de usuario */}
            <Col md={6} className="text-end">
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  className="shadow-sm d-flex align-items-center"
                  style={{ borderRadius: "30px", padding: "8px 14px" }}
                >
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

          {/* Title and Add Product */}
          <Row className="align-items-center mb-3">
            <Col>
              <h2 className="fw-bold text-primary">Productos</h2>
            </Col>
            <Col className="text-end">
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <BsPlusLg className="me-1" /> Agregar Producto
              </Button>
            </Col>
          </Row>

          {/* Products Table */}
          <div className="rounded-4 overflow-hidden shadow-sm">
            <Table striped hover responsive className="m-0">
              <thead className="table-light">
                <tr>
                  <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                    Nombre {renderSortIcon("name")}
                  </th>
                  <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                    ID {renderSortIcon("id")}
                  </th>
                  <th onClick={() => handleSort("sku")} style={{ cursor: "pointer" }}>
                    SKU {renderSortIcon("sku")}
                  </th>
                  <th onClick={() => handleSort("price")} style={{ cursor: "pointer" }}>
                    Precio {renderSortIcon("price")}
                  </th>
                  <th onClick={() => handleSort("stock")} style={{ cursor: "pointer" }}>
                    Stock {renderSortIcon("stock")}
                  </th>
                  <th onClick={() => handleSort("type")} style={{ cursor: "pointer" }}>
                    Tipo {renderSortIcon("type")}
                  </th>
                  <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                    Status {renderSortIcon("status")}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {sortedProducts.length > 0 ? (
                  sortedProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="d-flex align-items-center gap-2">
                        <img
                          src={p.image_url || DEFAULT_IMAGE}
                          alt={p.name}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #ddd"
                          }}
                        />
                        {p.name}
                      </td>
                      <td>{p.id}</td>
                      <td>{p.sku}</td>
                      <td>{Number(p.price).toFixed(2)}</td>
                      <td>{findStock(p.id)}</td>
                      <td>{p.type}</td>
                      <td>{renderStatusBadge(p.status)}</td>
                      <td className="text-center">
                        <Dropdown align="end">
                          <Dropdown.Toggle
                            variant="light"
                            id={`dropdown-${p.id}`}
                            size="sm"
                            className="border-0 bg-transparent text-dark"
                          >
                            <BsThreeDotsVertical />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEdit(p)}>✏️ Editar</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleStock(p)}>📦 Stock</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDelete(p.id)}>🗑️ Eliminar</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-3">
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Modal Product */}
          <Modal show={showModal} onHide={() => { setShowModal(false); setEditProduct(null); setFormData(INITIAL_FORM); }}>
            <Modal.Header closeButton>
              <Modal.Title>{editProduct ? "Editar" : "Agregar"} Producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label>SKU</Form.Label>
                  <Form.Control value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Precio</Form.Label>
                  <Form.Control type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Stock inicial</Form.Label>
                  <Form.Control type="number" value={formData.initial_stock} onChange={e => setFormData({ ...formData, initial_stock: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Control value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>URL de imagen (opcional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/product-image.jpg"
                  />
                </Form.Group>
                <div className="text-end">
                  <Button type="submit">{editProduct ? "Actualizar" : "Crear"}</Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          <Modal show={showStockModal} onHide={() => setShowStockModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>
                Ajustar Stock – {stockProduct?.name} ({stockProduct?.sku})
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={submitStock}>
                <Form.Group className="mb-2">
                  <Form.Label>Cambio en cantidad (positivo o negativo)</Form.Label>
                  <Form.Control
                    type="number"
                    value={stockData.quantity_change}
                    onChange={e => setStockData({ ...stockData, quantity_change: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Motivo</Form.Label>
                  <Form.Control
                    type="text"
                    value={stockData.reason}
                    onChange={e => setStockData({ ...stockData, reason: e.target.value })}
                    placeholder="Ej. Llegó mercancía, devolución, ajuste..."
                    required
                  />
                </Form.Group>
                <div className="text-end">
                  <Button variant="primary" type="submit">Guardar</Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
