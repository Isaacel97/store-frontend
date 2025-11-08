import { InputGroup, Form } from "react-bootstrap";
import { BsSearch } from "react-icons/bs";

export default function SearchBar({ value, onChange, placeholder = "Buscar...", className = "" }) {
  return (
    <InputGroup className={`rounded-pill overflow-hidden shadow-sm ${className}`}>
      <InputGroup.Text className="bg-white border-0">
        <BsSearch />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="border-0"
      />
    </InputGroup>
  );
}