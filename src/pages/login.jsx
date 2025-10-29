"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Form, Button, Toast, ToastContainer, InputGroup } from "react-bootstrap";
import { login } from "../api/auth";
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { playSound } from "../hooks/Sound"

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "", icon: null });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ username, password });
      console.log("Respuesta de login:", res);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("me", JSON.stringify({ id: res.data.id, username: res.data.username, role: res.data.role }));

        setToast({
          show: true,
          message: res.data.message || "Login exitoso",
          variant: "success",
          icon: <FaCheckCircle size={20} className="me-2" />,
        });
        
        playSound("success");
        setTimeout(() => router.push("/"), 1500);
      } else {
        throw new Error("Login fallido");
      }
    } catch (err) {
      console.error(err);
      setUsername("");
      setPassword("");
      setToast({
        show: true,
        message: "Usuario o contraseña incorrecta",
        variant: "danger",
        icon: <FaTimesCircle size={20} className="me-2" />,
      });
      playSound("error");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4 text-primary fw-bold">Iniciar Sesión</h2>

      <Form onSubmit={handleSubmit} className="shadow p-4 m-4 rounded bg-white border">
        <Form.Group className="mb-3">
          <Form.Label>Usuario</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu usuario"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 fw-semibold">
          Ingresar
        </Button>

        <div className="text-center">
          <small>
            ¿No tienes cuenta?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push("/register");
              }}
              className="text-primary fw-semibold text-decoration-none"
            >
              Crea una aquí
            </a>
          </small>
        </div>
      </Form>

      {/* Toast con íconos */}
      <ToastContainer position="top-end" className="p-3">
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
