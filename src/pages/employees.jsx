import { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Form, Container, Row, Col, Dropdown } from "react-bootstrap";
import { BsThreeDotsVertical, BsArrowUp, BsArrowDown, BsPlusLg } from "react-icons/bs";
import { getEmployees, createEmployee, getShiftsByUser, createShift, clockIn, clockOut } from "../api/employees";
import { useRouter } from "next/router";
import {ProtectedRoute, Sidebar, ToastComponent, PanelContainer, Header} from "@/components";

export default function EmployeesPage() {
  const DEFAULT_AVATAR = "https://png.pngtree.com/element_our/20190528/ourmid/pngtree-no-photo-icon-image_1128432.jpg";
  const INITIAL_USER_FORM = { username: "", email: "", password: "", full_name: "", role: "seller" };
  const INITIAL_SHIFT = { user_id: "", day_of_week: 1, start_time: "08:00", end_time: "16:00" };
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [newUser, setNewUser] = useState(INITIAL_USER_FORM);
  const [showShift, setShowShift] = useState(false);
  const [newShift, setNewShift] = useState(INITIAL_SHIFT);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const router = useRouter();
  const [user, setUser] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("me") || "{}");
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    router.push("/login");
  };

  const fetchAll = async () => {
    try {
      const u = await getEmployees();
      setEmployees(u);
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message: "Error cargando empleados",
        type: "error",
      });
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createEmployee(newUser);
      setShowNew(false);
      setNewUser(INITIAL_USER_FORM);
      fetchAll();
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message: "Error creando usuario",
        type: "error",
      });
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
      setNewShift(INITIAL_SHIFT);
      if (selected) handleSelect(selected);
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message: "Error creando turno",
        type: "error",
      });
    }
  };

  const handleClockIn = async (userId, shift_id) => {
    try {
      await clockIn(userId, shift_id);
      setToast({
        show: true,
        message: "Check-in registrado",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message: err.response?.data?.error || "Error en check-in",
        type: "error",
      });
    }
  };

  const handleClockOut = async (userId) => {
    try {
      await clockOut(userId);
      setToast({
        show: true,
        message: "Check-out registrado",
        type: "success",
      });
    } catch (err) {
      console.error(err);

      setToast({
        show: true,
        message: err.response?.data?.error || "Error en check-out",
        type: "error",
      });
    }
  };

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter(e =>
      (e.full_name || e.username || "").toLowerCase().includes(term) ||
      String(e.id).includes(term) ||
      (e.email || "").toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  const sortedEmployees = useMemo(() => {
    if (!sortConfig.key) return filteredEmployees;
    return [...filteredEmployees].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortConfig.direction === "asc"
        ? String(aVal || "").localeCompare(String(bVal || ""))
        : String(bVal || "").localeCompare(String(aVal || ""));
    });
  }, [filteredEmployees, sortConfig]);

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

  const renderRoleBadge = (role) => (
    <span
      style={{
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "16px",
        fontWeight: 600,
        fontSize: "0.85rem",
        color: "white",
        backgroundColor: role === "admin" ? "#0d6efd" : "#6c757d",
        textTransform: "capitalize"
      }}
    >
      {role}
    </span>
  );

  return (
    <ProtectedRoute>
      <div className="d-flex">
        <Sidebar />
        <Container className="mt-3">
          <Header
            searchValue={searchTerm}
            onSearch={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por id, usuario o email..."
            user={user}
            onLogout={handleLogout}
          />

          <Row className="align-items-center mb-3">
            <Col><h2 className="fw-bold text-primary">Empleados</h2></Col>
            <Col className="text-end">
              <Button variant="primary" onClick={() => setShowNew(true)}>
                <BsPlusLg className="me-1" /> Nuevo Empleado
              </Button>
            </Col>
          </Row>

          <div className="rounded-4 overflow-hidden shadow-sm">
            <PanelContainer>
              <thead className="table-light">
                <tr>
                  <th onClick={() => handleSort("full_name")} style={{ cursor: "pointer" }}>
                    Nombre {renderSortIcon("full_name")}
                  </th>
                  <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                    ID {renderSortIcon("id")}
                  </th>
                  <th onClick={() => handleSort("username")} style={{ cursor: "pointer" }}>
                    Usuario {renderSortIcon("username")}
                  </th>
                  <th onClick={() => handleSort("email")} style={{ cursor: "pointer" }}>
                    Email {renderSortIcon("email")}
                  </th>
                  <th onClick={() => handleSort("role")} style={{ cursor: "pointer" }}>
                    Rol {renderSortIcon("role")}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.length > 0 ? (
                  sortedEmployees.map(u => (
                    <tr key={u.id}>
                      <td className="d-flex align-items-center gap-2">
                        <img
                          src={u.image_url || DEFAULT_AVATAR}
                          alt={u.full_name || u.username}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #ddd"
                          }}
                        />
                        <div>
                          <div className="fw-semibold">{u.full_name || u.username}</div>
                          <div className="text-muted" style={{ fontSize: "0.85rem" }}>{u.email}</div>
                        </div>
                      </td>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{renderRoleBadge(u.role)}</td>
                      <td className="text-center">
                        <Dropdown align="end">
                          <Dropdown.Toggle
                            variant="light"
                            id={`dropdown-${u.id}`}
                            size="sm"
                            className="border-0 bg-transparent text-dark"
                          >
                            <BsThreeDotsVertical />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleSelect(u)}>📋 Ver Turnos</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleClockIn(u.id, null)}>🟢 Check-in</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleClockOut(u.id)}>🔴 Check-out</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">
                      No se encontraron empleados
                    </td>
                  </tr>
                )}
              </tbody>
            </PanelContainer>
          </div>

          {/* Modal Crear Empleado (armonizado visualmente) */}
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

          <ToastComponent
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        </Container>
      </div>
    </ProtectedRoute>
  );
}
