"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Form, Button, Toast, ToastContainer, InputGroup } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash} from "react-icons/fa";
import { playSound } from "../hooks/Sound";
import { register } from "../api/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    confirmPassword: "",
    role: "viewer",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "",
    icon: null,
  });

  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const validatePassword = (password) => {
    const errors = {
      length: password.length >= 8 && password.length <= 64,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()\-_=+\[\]{};:'",.<>\/?\\|`~]/.test(password),
    };
    setPasswordErrors(errors);
    return Object.values(errors).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "password") {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(form.password)) {
      setToast({
        show: true,
        message: "La contraseña no cumple con los requisitos.",
        variant: "danger",
        icon: <FaTimesCircle size={20} className="me-2" />,
      });
      playSound("error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setToast({
        show: true,
        message: "Las contraseñas no coinciden.",
        variant: "danger",
        icon: <FaTimesCircle size={20} className="me-2" />,
      });
      playSound("error");
      return;
    }

    try {
      const res = await register({ username: form.username, email: form.email, full_name: form.full_name, password: form.password, role: form.role });
      console.log("Respuesta de registro:", res);
      if (res.status === 201) {
        setToast({
          show: true,
          message: res.message || "Usuario creado con éxito",
          variant: "success",
          icon: <FaCheckCircle size={20} className="me-2" />,
        });
        playSound("success");
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch (err) {
      console.error("Error de registro:", err);
      const msg =
        err.response?.data?.error ||
        "Error al crear la cuenta. Intenta nuevamente.";
      setToast({
        show: true,
        message: msg,
        variant: "danger",
        icon: <FaTimesCircle size={20} className="me-2" />,
      });
      playSound("error");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="text-center mb-4 text-primary fw-bold">Crear Cuenta</h2>

      <Form onSubmit={handleSubmit} className="shadow p-4 rounded bg-white border">
        <Form.Group className="mb-3">
          <Form.Label>Nombre completo</Form.Label>
          <Form.Control
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Ej. Carlos Hernández"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Usuario</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Nombre de usuario"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Correo electrónico</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tu@correo.com"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Debe incluir mayúsculas, minúsculas, número y símbolo"
              required
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
          <div className="mt-2 ms-1 small">
            <ul className="mb-0 list-unstyled text-secondary">
              <li className={passwordErrors.length ? "text-success" : "text-danger"}>
                • Entre 8 y 64 caracteres
              </li>
              <li className={passwordErrors.upper ? "text-success" : "text-danger"}>
                • Una letra mayúscula
              </li>
              <li className={passwordErrors.lower ? "text-success" : "text-danger"}>
                • Una letra minúscula
              </li>
              <li className={passwordErrors.number ? "text-success" : "text-danger"}>
                • Un número
              </li>
              <li className={passwordErrors.special ? "text-success" : "text-danger"}>
                • Un carácter especial (!@#...)
              </li>
            </ul>
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirmar contraseña</Form.Label>
          <InputGroup>
            <Form.Control
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Vuelve a escribir la contraseña"
              required
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Rol</Form.Label>
          <Form.Select name="role" value={form.role} onChange={handleChange}>
            <option value="viewer">Viewer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 fw-semibold mb-3">
          Crear cuenta
        </Button>

        <div className="text-center">
          <small>
            ¿Ya tienes una cuenta?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push("/login");
              }}
              className="text-primary fw-semibold text-decoration-none"
            >
              Inicia sesión aquí
            </a>
          </small>
        </div>
      </Form>

      {/* Toasts */}
      <ToastContainer 
        position="top-end" 
        className="p-3"
          style={{
            position: "fixed",
            top: "1rem",
            zIndex: 9999,
          }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={2500}
          autohide
          bg={toast.variant}
        >
          <Toast.Body className="d-flex align-items-center text-white fw-semibold">
            {toast.icon}
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}
