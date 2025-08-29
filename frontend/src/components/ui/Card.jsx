import styled from 'styled-components';

const CardContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-color);
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--light-gray);
  display: flex;
  align-items: center;
  justify-content: ${props => props.align || 'flex-end'};
  gap: 1rem;
`;

const Card = ({ children, className }) => {
  return <CardContainer className={className}>{children}</CardContainer>;
};

Card.Header = ({ children, className }) => {
  return <CardHeader className={className}>{children}</CardHeader>;
};

Card.Body = ({ children, className }) => {
  return <CardBody className={className}>{children}</CardBody>;
};

Card.Footer = ({ children, className, align }) => {
  return <CardFooter className={className} align={align}>{children}</CardFooter>;
};

export default Card;