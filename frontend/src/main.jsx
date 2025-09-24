import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import theme from './theme';
import './index.css';
import './styles/toast.css';
import './utils/axios'; // Importar configuración de axios

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <App />
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={true} 
          newestOnTop 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
          style={{ 
            zIndex: 1700,
            fontSize: '14px',
            maxWidth: '90vw'
          }}
          toastStyle={{
            fontSize: '14px',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            margin: '8px',
            maxWidth: '90vw'
          }}
        />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);