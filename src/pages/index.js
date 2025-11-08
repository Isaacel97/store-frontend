import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Dropdown } from "react-bootstrap";
import { useRouter } from "next/router";
import {ProtectedRoute, Sidebar, UserMenu} from "@/components";

export default function Dashboard() {
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

  return (
    <ProtectedRoute>
      <div className="d-flex bg-light vh-100">
        <Sidebar />
        <Container fluid className="mt-3">
          <Row className="align-items-center mb-3">
            <Col />
            <Col className="text-end">
              <UserMenu user={user} onLogout={handleLogout} />
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