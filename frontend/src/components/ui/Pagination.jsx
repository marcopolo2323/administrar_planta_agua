import styled from 'styled-components';

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
`;

const PaginationList = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.25rem;
`;

const PaginationItem = styled.li`
  margin: 0;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  border-radius: 4px;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--light-gray)'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--light-gray)'};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className
}) => {
  // Función para generar el rango de páginas a mostrar
  const generatePaginationItems = () => {
    const items = [];
    
    // Siempre mostrar la primera página
    items.push(1);
    
    // Calcular el rango de páginas alrededor de la página actual
    const leftSibling = Math.max(currentPage - siblingCount, 2);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);
    
    // Determinar si mostrar puntos suspensivos a la izquierda
    if (leftSibling > 2) {
      items.push('...');
    }
    
    // Agregar páginas en el rango calculado
    for (let i = leftSibling; i <= rightSibling; i++) {
      items.push(i);
    }
    
    // Determinar si mostrar puntos suspensivos a la derecha
    if (rightSibling < totalPages - 1) {
      items.push('...');
    }
    
    // Siempre mostrar la última página si hay más de una página
    if (totalPages > 1) {
      items.push(totalPages);
    }
    
    return items;
  };
  
  // Si solo hay una página, no mostrar paginación
  if (totalPages <= 1) return null;
  
  const paginationItems = generatePaginationItems();
  
  return (
    <PaginationContainer className={className}>
      <PaginationList>
        {/* Botón Anterior */}
        <PaginationItem>
          <PaginationButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </PaginationButton>
        </PaginationItem>
        
        {/* Páginas */}
        {paginationItems.map((item, index) => (
          <PaginationItem key={index}>
            {item === '...' ? (
              <PaginationButton disabled>
                &hellip;
              </PaginationButton>
            ) : (
              <PaginationButton
                active={currentPage === item}
                onClick={() => onPageChange(item)}
              >
                {item}
              </PaginationButton>
            )}
          </PaginationItem>
        ))}
        
        {/* Botón Siguiente */}
        <PaginationItem>
          <PaginationButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </PaginationButton>
        </PaginationItem>
      </PaginationList>
    </PaginationContainer>
  );
};

export default Pagination;