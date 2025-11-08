import { Table } from "react-bootstrap";

export default function PanelContainer({ children, tableProps = {}, className = "" }) {
  return (
    <div className={`rounded-4 overflow-hidden shadow-sm ${className}`}>
      <Table striped hover responsive className="m-0" {...tableProps}>
        {children}
      </Table>
    </div>
  );
}