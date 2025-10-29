import { Navbar, Container } from "react-bootstrap";

export default function TopNavbar() {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/">StoreApp</Navbar.Brand>
      </Container>
    </Navbar>
  );
}
