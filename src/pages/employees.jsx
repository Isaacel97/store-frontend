import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Container, Row, Col } from "react-bootstrap";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import { getEmployees, createEmployee, getShiftsByUser, createShift, clockIn, clockOut } from "../api/employees";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", full_name: "", role: "seller" });
  const [showShift, setShowShift] = useState(false);
  const [newShift, setNewShift] = useState({ user_id: "", day_of_week: 1, start_time: "08:00", end_time: "16:00" });

  const fetchAll = async () => {
    try {
      const u = await getEmployees();
      console.log("Empleados cargados:", u);
      setEmployees(u);
    } catch (err) {
      console.error(err);
      alert("Error cargando empleados");
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createEmployee(newUser);
      setShowNew(false);
      setNewUser({ username: "", email: "", password: "", full_name: "", role: "seller" });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error creando usuario");
    }
  };

  const handleSelect = async (user) => {
    setSelected(user);
    try {
      const s = await getShiftsByUser(user.id);
      setShifts(s);
    } catch (err) {
      console.error(err);
      setShifts([]);
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      await createShift(newShift);
      setShowShift(false);
      setNewShift({ user_id: "", day_of_week: 1, start_time: "08:00", end_time: "16:00" });
      if (selected) handleSelect(selected);
    } catch (err) {
      console.error(err);
      alert("Error creando turno");
    }
  };

  const handleClockIn = async (userId, shift_id) => {
    try {
      await clockIn(userId, shift_id);
      alert("Check-in registrado");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error en check-in");
    }
  };

  const handleClockOut = async (userId) => {
    try {
      await clockOut(userId);
      alert("Check-out registrado");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error en check-out");
    }
  };

  return (
    <ProtectedRoute>
      <div className="d-flex">
        <Sidebar />
        <Container className="mt-3">
          <Row>
            <Col><h2>Empleados</h2></Col>
            <Col className="text-end">
              <Button onClick={() => setShowNew(true)}>Nuevo Empleado</Button>{' '}
            </Col>
          </Row>

          <Table striped bordered hover responsive className="mt-3">
            <thead><tr><th>ID</th><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Acciones</th></tr></thead>
            <tbody>
              {employees.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.full_name}</td>
                  <td>{u.role}</td>
                  <td>
                    <Button size="sm" onClick={() => handleSelect(u)}>Ver Turnos</Button>{' '}
                    <Button size="sm" variant="success" onClick={() => handleClockIn(u.id, null)}>Check-in</Button>{' '}
                    <Button size="sm" variant="secondary" onClick={() => handleClockOut(u.id)}>Check-out</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Modal show={showNew} onHide={() => setShowNew(false)}>
            <Modal.Header closeButton><Modal.Title>Crear Empleado</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleCreateUser}>
                <Form.Group className="mb-2"><Form.Label>Usuario</Form.Label><Form.Control value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required/></Form.Group>
                <Form.Group className="mb-2"><Form.Label>Nombre</Form.Label><Form.Control value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>Email</Form.Label><Form.Control value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>Password</Form.Label><Form.Control type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required/></Form.Group>
                <Form.Group className="mb-2"><Form.Label>Rol</Form.Label><Form.Select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}><option value="seller">Vendedor</option><option value="admin">Admin</option></Form.Select></Form.Group>
                <div className="text-end"><Button type="submit">Crear</Button></div>
              </Form>
            </Modal.Body>
          </Modal>

          <hr />

          {selected && (
            <>
              <h4>Turnos de {selected.full_name || selected.username}</h4>
              <Button onClick={() => setShowShift(true)}>Agregar Turno</Button>
              <Table striped bordered hover className="mt-2">
                <thead><tr><th>ID</th><th>Día</th><th>Hora inicio</th><th>Hora fin</th></tr></thead>
                <tbody>
                  {shifts.map(s => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.day_of_week}</td>
                      <td>{s.start_time}</td>
                      <td>{s.end_time}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

          <Modal show={showShift} onHide={() => setShowShift(false)}>
            <Modal.Header closeButton><Modal.Title>Nuevo Turno</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleCreateShift}>
                <Form.Group className="mb-2">
                  <Form.Label>Usuario</Form.Label>
                  <Form.Select value={newShift.user_id} onChange={e => setNewShift({ ...newShift, user_id: Number(e.target.value) })} required>
                    <option value="">Selecciona</option>
                    {employees.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-2"><Form.Label>Día (0-6)</Form.Label><Form.Control value={newShift.day_of_week} onChange={e => setNewShift({...newShift, day_of_week: Number(e.target.value)})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>Inicio</Form.Label><Form.Control type="time" value={newShift.start_time} onChange={e => setNewShift({...newShift, start_time: e.target.value})} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>Fin</Form.Label><Form.Control type="time" value={newShift.end_time} onChange={e => setNewShift({...newShift, end_time: e.target.value})} /></Form.Group>
                <div className="text-end"><Button type="submit">Crear</Button></div>
              </Form>
            </Modal.Body>
          </Modal>

        </Container>
      </div>
    </ProtectedRoute>
  );
}
