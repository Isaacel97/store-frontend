import { Container, Row, Col, Card, Dropdown } from "react-bootstrap";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();
  const user = JSON.parse(localStorage.getItem("me") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="d-flex bg-light vh-100">
        <Sidebar />
        <Container fluid className="mt-3">
          <Row className="align-items-center mb-3">
            <Col />
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

          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Ventas Hoy</Card.Title>
                  <Card.Text>$0.00</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Productos en Stock Bajo</Card.Title>
                  <Card.Text>0</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Empleados Activos</Card.Title>
                  <Card.Text>0</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </ProtectedRoute>
  );
}