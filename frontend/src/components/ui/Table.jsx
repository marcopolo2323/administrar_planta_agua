import styled from 'styled-components';

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: white;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
  }
  
  th {
    background-color: var(--light-gray);
    font-weight: 600;
    color: var(--dark-gray);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  tr:not(:last-child) td {
    border-bottom: 1px solid var(--light-gray);
  }
  
  tbody tr:hover {
    background-color: rgba(0, 119, 182, 0.05);
  }
  
  td {
    font-size: 0.875rem;
  }
`;

const TableHeader = styled.thead``;

const TableBody = styled.tbody`
  tr:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.02);
  }
`;

const TableFooter = styled.tfoot`
  background-color: var(--light-gray);
  
  td {
    font-weight: 500;
  }
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--medium-gray);
  
  p {
    margin-bottom: 1rem;
  }
`;

const Table = ({ children, className }) => {
  return (
    <TableContainer className={className}>
      <StyledTable>{children}</StyledTable>
    </TableContainer>
  );
};

Table.Header = ({ children }) => {
  return <TableHeader>{children}</TableHeader>;
};

Table.Body = ({ children, data, renderRow, emptyMessage }) => {
  if (data && data.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan="100%">
            <EmptyState>
              <p>{emptyMessage || 'No hay datos disponibles'}</p>
            </EmptyState>
          </td>
        </tr>
      </tbody>
    );
  }
  
  if (data && renderRow) {
    return (
      <TableBody>
        {data.map((item, index) => renderRow(item, index))}
      </TableBody>
    );
  }
  
  return <TableBody>{children}</TableBody>;
};

Table.Footer = ({ children }) => {
  return <TableFooter>{children}</TableFooter>;
};

Table.Row = styled.tr``;

Table.Cell = styled.td`
  ${props => props.align && `text-align: ${props.align};`}
`;

Table.HeaderCell = styled.th`
  ${props => props.align && `text-align: ${props.align};`}
  ${props => props.width && `width: ${props.width};`}
`;

export default Table;