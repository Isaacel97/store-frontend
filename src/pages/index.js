import { Container, Row, Col, Card } from "react-bootstrap";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="d-flex bg-light vh-100">
        <Sidebar />
        <Container fluid className="mt-3">
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
