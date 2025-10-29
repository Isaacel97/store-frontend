import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Container, Row, Col, Dropdown, InputGroup } from "react-bootstrap";
import { BsThreeDotsVertical, BsSearch, BsArrowUp, BsArrowDown } from "react-icons/bs";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import { getProducts, createProduct, updateProduct, deleteProduct, getInventory } from "../api/products";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({ sku: "", name: "", price: 0, type: "", status: "active", initial_stock: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      setShowModal(false);
      setEditProduct(null);
      setFormData({ sku: "", name: "", price: 0, type: "", status: "active", initial_stock: 0 });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error guardando producto");
    }
  };

  const handleEdit = (p) => {
    setEditProduct(p);
    setFormData({ sku: p.sku, name: p.name, price: p.price, type: p.type, status: p.status });
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

  const findStock = (productId) => {
    const row = inventory.find(i => i.product_id === productId || i.product_id == productId);
    return row ? row.quantity : 0;
  };

  // 🔍 Filtrado de productos
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔄 Ordenamiento de columnas
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = sortConfig.key === "stock" ? findStock(a.id) : a[sortConfig.key];
    const bVal = sortConfig.key === "stock" ? findStock(b.id) : b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
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
          </Row>

          <Row className="align-items-center mb-3">
            <Col>
              <h2 className="fw-bold text-primary">Productos</h2>
            </Col>
            <Col className="text-end">
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Agregar Producto
              </Button>
            </Col>
          </Row>

          <div className="rounded-4 overflow-hidden shadow-sm">
            <Table striped bordered hover responsive className="m-0">
              <thead className="table-light">
                <tr>
                  <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                    ID {renderSortIcon("id")}
                  </th>
                  <th onClick={() => handleSort("sku")} style={{ cursor: "pointer" }}>
                    SKU {renderSortIcon("sku")}
                  </th>
                  <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                    Nombre {renderSortIcon("name")}
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
              <tbody>
                {sortedProducts.length > 0 ? (
                  sortedProducts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.sku}</td>
                      <td>{p.name}</td>
                      <td>{Number(p.price).toFixed(2)}</td>
                      <td>{findStock(p.id)}</td>
                      <td>{p.type}</td>
                      <td>{p.status}</td>
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

          {/* Modal */}
          <Modal show={showModal} onHide={() => { setShowModal(false); setEditProduct(null); }}>
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
                  <Form.Control type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                </Form.Group>
                {!editProduct && (
                  <Form.Group className="mb-2">
                    <Form.Label>Stock inicial</Form.Label>
                    <Form.Control type="number" value={formData.initial_stock} onChange={e => setFormData({ ...formData, initial_stock: Number(e.target.value) })} />
                  </Form.Group>
                )}
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
                <div className="text-end">
                  <Button type="submit">{editProduct ? "Actualizar" : "Crear"}</Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
