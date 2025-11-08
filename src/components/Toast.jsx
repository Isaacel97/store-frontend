import {Toast, ToastContainer} from "react-bootstrap";
import { FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import { CiWarning, CiCircleInfo } from "react-icons/ci";

export default function ToastComponent({ show, message, onClose, type }) {
  let variant = "primary";
  let icon = null;

  if (type === "success") {
    variant = "success";
    icon = <FaCheckCircle size={20} className="me-2" />;
  } else if (type === "error") {
    variant = "danger";
    icon = <FaTimesCircle size={20} className="me-2" />;
  } else if (type === "info") {
    variant = "info";
    icon = <CiCircleInfo size={20} className="me-2" />;
  } else if (type === "warning") {
    variant = "warning";
    icon = <CiWarning size={20} className="me-2" />;
  }

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast bg={variant} onClose={onClose} show={show} delay={2500} autohide>
        <Toast.Body className="d-flex align-items-center text-white fw-semibold">
          {icon}
          <span>{message}</span>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}