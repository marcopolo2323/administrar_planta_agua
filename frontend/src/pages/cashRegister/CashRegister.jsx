import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/FormElements';
import Table from '../../components/ui/Table';

const CashRegister = () => {
  // Estados
  const [currentRegister, setCurrentRegister] = useState(null);
  const [registerHistory, setRegisterHistory] = useState([]);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState(null);
  const [openingAmount, setOpeningAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [movementType, setMovementType] = useState('ingreso');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementConcept, setMovementConcept] = useState('');
  const [movementNotes, setMovementNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener caja actual
      try {
        const currentResponse = await axios.get('/api/cash-register/current');
        if (currentResponse.data && currentResponse.data.cashRegister) {
          setCurrentRegister(currentResponse.data);
        } else {
          setCurrentRegister(null);
        }
      } catch (err) {
        console.error('Error al obtener caja actual:', err);
        setCurrentRegister(null);
      }
      
      // Obtener historial de cajas
      try {
        const historyResponse = await axios.get('/api/cash-register/history');
        setRegisterHistory(historyResponse.data);
      } catch (err) {
        console.error('Error al obtener historial:', err);
        setRegisterHistory([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar datos. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Abrir caja
  const handleOpenRegister = async () => {
    try {
      if (!openingAmount || parseFloat(openingAmount) < 0) {
        setError('Debe ingresar un monto válido');
        return;
      }
      
      setLoading(true);
      
      await axios.post('/api/cash-register/open', {
        openingAmount: parseFloat(openingAmount)
      });
      
      setSuccess('Caja abierta correctamente');
      setShowOpenModal(false);
      setOpeningAmount('');
      
      // Recargar datos
      fetchData();
      
      setLoading(false);
    } catch (error) {
      console.error('Error al abrir caja:', error);
      setError('Error al abrir caja. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Cerrar caja
  const handleCloseRegister = async () => {
    try {
      if (!actualAmount || parseFloat(actualAmount) < 0) {
        setError('Debe ingresar un monto válido');
        return;
      }
      
      setLoading(true);
      
      await axios.post('/api/cash-register/close', {
        actualAmount: parseFloat(actualAmount)
      });
      
      setSuccess('Caja cerrada correctamente');
      setShowCloseModal(false);
      setActualAmount('');
      
      // Recargar datos
      fetchData();
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cerrar caja:', error);
      setError('Error al cerrar caja. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Registrar movimiento
  const handleRegisterMovement = async () => {
    try {
      if (!movementAmount || parseFloat(movementAmount) <= 0) {
        setError('Debe ingresar un monto válido');
        return;
      }
      
      if (!movementConcept) {
        setError('Debe ingresar un concepto');
        return;
      }
      
      setLoading(true);
      
      await axios.post('/api/cash-register/movement', {
        type: movementType,
        amount: parseFloat(movementAmount),
        concept: movementConcept,
        notes: movementNotes
      });
      
      setSuccess('Movimiento registrado correctamente');
      setShowMovementModal(false);
      setMovementAmount('');
      setMovementConcept('');
      setMovementNotes('');
      setMovementType('ingreso');
      
      // Recargar datos
      fetchData();
      
      setLoading(false);
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      setError('Error al registrar movimiento. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Ver detalles de caja
  const handleViewDetails = async (registerId) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`/api/cash-register/${registerId}`);
      setSelectedRegister(response.data);
      setShowDetailsModal(true);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener detalles:', error);
      setError('Error al obtener detalles. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Renderizar caja actual
  const renderCurrentRegister = () => {
    if (!currentRegister) {
      return (
        <Card>
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">No hay caja abierta</h2>
            <Button 
              variant="primary" 
              onClick={() => setShowOpenModal(true)}
            >
              Abrir Caja
            </Button>
          </div>
        </Card>
      );
    }
    
    return (
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Caja Actual</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">Fecha de apertura:</p>
              <p className="font-semibold">{new Date(currentRegister.openingDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Monto inicial:</p>
              <p className="font-semibold">${typeof currentRegister.openingAmount === 'number' ? currentRegister.openingAmount.toFixed(2) : currentRegister.openingAmount !== undefined && currentRegister.openingAmount !== null ? parseFloat(currentRegister.openingAmount).toFixed(2) : '0.00'}</p>
            </div>
            <div>
              <p className="text-gray-600">Estado:</p>
              <p className="font-semibold">{currentRegister.status === 'abierto' ? 'Abierta' : 'Cerrada'}</p>
            </div>
            <div>
              <p className="text-gray-600">Monto actual (estimado):</p>
              <p className="font-semibold">${typeof currentRegister.expectedAmount === 'number' ? currentRegister.expectedAmount.toFixed(2) : currentRegister.expectedAmount !== undefined && currentRegister.expectedAmount !== null ? parseFloat(currentRegister.expectedAmount).toFixed(2) : '0.00'}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="primary" 
              onClick={() => setShowMovementModal(true)}
            >
              Registrar Movimiento
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowCloseModal(true)}
            >
              Cerrar Caja
            </Button>
          </div>
          
          {currentRegister.movements && currentRegister.movements.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Movimientos</h3>
              <div className="overflow-x-auto">
                <Table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Concepto</th>
                      <th>Monto</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRegister.movements.map(movement => (
                      <tr key={movement.id}>
                        <td>
                          <span className={`px-2 py-1 rounded text-xs ${movement.type === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {movement.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                          </span>
                        </td>
                        <td>{movement.concept}</td>
                        <td className="text-right">${typeof movement.amount === 'number' ? movement.amount.toFixed(2) : (movement.amount && !isNaN(parseFloat(movement.amount))) ? parseFloat(movement.amount).toFixed(2) : movement.amount}</td>
                        <td>{new Date(movement.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };
  
  // Renderizar historial de cajas
  const renderRegisterHistory = () => {
    if (registerHistory.length === 0) {
      return (
        <Card>
          <div className="p-6 text-center">
            <p>No hay historial de cajas</p>
          </div>
        </Card>
      );
    }
    
    return (
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Historial de Cajas</h2>
          
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Fecha Apertura</th>
                  <th>Fecha Cierre</th>
                  <th>Monto Inicial</th>
                  <th>Monto Final</th>
                  <th>Diferencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registerHistory.map(register => (
                  <tr key={register.id}>
                    <td>{new Date(register.openingDate).toLocaleString()}</td>
                    <td>{register.closingDate ? new Date(register.closingDate).toLocaleString() : '-'}</td>
                    <td className="text-right">${typeof register.openingAmount === 'number' ? register.openingAmount.toFixed(2) : (register.openingAmount && !isNaN(parseFloat(register.openingAmount))) ? parseFloat(register.openingAmount).toFixed(2) : register.openingAmount}</td>
                <td className="text-right">${register.actualAmount ? (typeof register.actualAmount === 'number' ? register.actualAmount.toFixed(2) : (register.actualAmount && !isNaN(parseFloat(register.actualAmount))) ? parseFloat(register.actualAmount).toFixed(2) : register.actualAmount) : '-'}</td>
                    <td className={`text-right ${register.difference && parseFloat(register.difference) < 0 ? 'text-red-600' : register.difference && parseFloat(register.difference) > 0 ? 'text-green-600' : ''}`}>
                      {register.difference ? `$${typeof register.difference === 'number' ? register.difference.toFixed(2) : (register.difference && !isNaN(parseFloat(register.difference))) ? parseFloat(register.difference).toFixed(2) : register.difference}` : '-'}
                    </td>
                    <td>
                      <Button 
                        variant="link" 
                        onClick={() => handleViewDetails(register.id)}
                      >
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Card>
    );
  };
  
  // Modal para abrir caja
  const renderOpenModal = () => (
    <Modal 
      isOpen={showOpenModal} 
      onClose={() => setShowOpenModal(false)}
      title="Abrir Caja"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto Inicial</label>
          <Input
            type="number"
            value={openingAmount}
            onChange={(e) => setOpeningAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="secondary" 
            onClick={() => setShowOpenModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleOpenRegister}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Abrir Caja'}
          </Button>
        </div>
      </div>
    </Modal>
  );
  
  // Modal para cerrar caja
  const renderCloseModal = () => (
    <Modal 
      isOpen={showCloseModal} 
      onClose={() => setShowCloseModal(false)}
      title="Cerrar Caja"
    >
      <div className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-gray-600">Monto inicial:</p>
          <p className="font-semibold">${currentRegister?.openingAmount ? parseFloat(currentRegister.openingAmount).toFixed(2) : '0.00'}</p>
          
          <p className="text-gray-600 mt-2">Monto esperado:</p>
          <p className="font-semibold text-xl">${currentRegister?.expectedAmount ? parseFloat(currentRegister.expectedAmount).toFixed(2) : '0.00'}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto Real en Caja</label>
          <Input
            type="number"
            value={actualAmount}
            onChange={(e) => setActualAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        
        {actualAmount && (
          <div className="text-center">
            <p className="text-gray-600">Diferencia:</p>
            <p className={`font-semibold ${parseFloat(actualAmount) < (currentRegister?.expectedAmount || 0) ? 'text-red-600' : parseFloat(actualAmount) > (currentRegister?.expectedAmount || 0) ? 'text-green-600' : ''}`}>
              ${(parseFloat(actualAmount) - (currentRegister?.expectedAmount ? parseFloat(currentRegister.expectedAmount) : 0)).toFixed(2)}
            </p>
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="secondary" 
            onClick={() => setShowCloseModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCloseRegister}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Cerrar Caja'}
          </Button>
        </div>
      </div>
    </Modal>
  );
  
  // Modal para registrar movimiento
  const renderMovementModal = () => (
    <Modal 
      isOpen={showMovementModal} 
      onClose={() => setShowMovementModal(false)}
      title="Registrar Movimiento"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
          <Select
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
          >
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
          <Input
            type="number"
            value={movementAmount}
            onChange={(e) => setMovementAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
          <Input
            type="text"
            value={movementConcept}
            onChange={(e) => setMovementConcept(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
          <textarea
            value={movementNotes}
            onChange={(e) => setMovementNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="secondary" 
            onClick={() => setShowMovementModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleRegisterMovement}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Registrar Movimiento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
  
  // Modal para ver detalles de caja
  const renderDetailsModal = () => (
    <Modal 
      isOpen={showDetailsModal} 
      onClose={() => setShowDetailsModal(false)}
      title="Detalles de Caja"
      size="lg"
    >
      {selectedRegister && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Fecha de apertura:</p>
              <p className="font-semibold">{new Date(selectedRegister.openingDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Fecha de cierre:</p>
              <p className="font-semibold">
                {selectedRegister.closingDate ? new Date(selectedRegister.closingDate).toLocaleString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Monto inicial:</p>
              <p className="font-semibold">${selectedRegister.openingAmount ? parseFloat(selectedRegister.openingAmount).toFixed(2) : '0.00'}</p>
            </div>
            <div>
              <p className="text-gray-600">Monto esperado:</p>
              <p className="font-semibold">${selectedRegister.expectedAmount ? parseFloat(selectedRegister.expectedAmount).toFixed(2) : '0.00'}</p>
            </div>
            <div>
              <p className="text-gray-600">Monto real:</p>
              <p className="font-semibold">
                {selectedRegister.actualAmount ? `$${parseFloat(selectedRegister.actualAmount).toFixed(2)}` : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Diferencia:</p>
              <p className={`font-semibold ${selectedRegister.difference && parseFloat(selectedRegister.difference) < 0 ? 'text-red-600' : selectedRegister.difference && parseFloat(selectedRegister.difference) > 0 ? 'text-green-600' : ''}`}>
                {selectedRegister.difference ? `$${parseFloat(selectedRegister.difference).toFixed(2)}` : '-'}
              </p>
            </div>
          </div>
          
          {selectedRegister.movements && selectedRegister.movements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Movimientos</h3>
              <div className="overflow-x-auto">
                <Table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Concepto</th>
                      <th>Monto</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRegister.movements.map(movement => (
                      <tr key={movement.id}>
                        <td>
                          <span className={`px-2 py-1 rounded text-xs ${movement.type === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {movement.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                          </span>
                        </td>
                        <td>{movement.concept}</td>
                        <td className="text-right">${movement.amount ? parseFloat(movement.amount).toFixed(2) : '0.00'}</td>
                        <td>{new Date(movement.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
          
          {selectedRegister.sales && selectedRegister.sales.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Ventas</h3>
              <div className="overflow-x-auto">
                <Table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRegister.sales.map(sale => (
                      <tr key={sale.id}>
                        <td>{sale.id}</td>
                        <td>{sale.Client?.name || 'Cliente General'}</td>
                        <td className="text-right">${typeof sale.total === 'number' ? sale.total.toFixed(2) : (sale.total && !isNaN(parseFloat(sale.total))) ? parseFloat(sale.total).toFixed(2) : sale.total}</td>
                        <td>{new Date(sale.date).toLocaleString()}</td>
                        <td>
                          <span className={`px-2 py-1 rounded text-xs ${
                            sale.status === 'pagado' ? 'bg-green-100 text-green-800' : 
                            sale.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Caja</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <span 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Cerrar</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Éxito:</strong>
          <span className="block sm:inline"> {success}</span>
          <span 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSuccess(null)}
          >
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Cerrar</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      
      <div className="space-y-6">
        {loading ? (
          <div className="text-center p-4">
            <p>Cargando datos...</p>
          </div>
        ) : (
          <>
            {renderCurrentRegister()}
            {renderRegisterHistory()}
          </>
        )}
      </div>
      
      {renderOpenModal()}
      {renderCloseModal()}
      {renderMovementModal()}
      {renderDetailsModal()}
    </div>
  );
};

export default CashRegister;