import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import { Row, Col } from "react-bootstrap";

export default function Header({
  searchValue,
  onSearch,
  placeholder = "Buscar...",
  user = {},
  onLogout,
  rightContent = null,
}) {
  return (
    <Row className="align-items-center mb-3">
      <Col md={6}>
        <SearchBar value={searchValue} onChange={onSearch} placeholder={placeholder} />
      </Col>

      <Col md={6} className="text-end">
        {rightContent || <UserMenu user={user} onLogout={onLogout} />}
      </Col>
    </Row>
  );
}