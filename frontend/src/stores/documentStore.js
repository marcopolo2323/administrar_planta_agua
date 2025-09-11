import { create } from 'zustand';

const useDocumentStore = create((set, get) => ({
  documents: [],
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },

  // Acciones
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Obtener todos los documentos
  fetchDocuments: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        type: params.type || 'all'
      });

      const response = await fetch(`/api/documents?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener documentos');
      }

      const data = await response.json();
      
      set({
        documents: data.data,
        pagination: data.pagination,
        loading: false
      });

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Obtener estadísticas de documentos
  fetchStats: async () => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      const data = await response.json();
      
      set({
        stats: data.data,
        loading: false
      });

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Descargar un documento
  downloadDocument: async (filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar documento');
      }

      // Crear blob y descargar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error al descargar documento:', error);
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Generar documento para un pedido
  generateDocument: async (orderId, orderType = 'regular', documentType = 'boleta') => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          orderType,
          documentType
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar documento');
      }

      const data = await response.json();
      
      set({ loading: false });

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error al generar documento:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Eliminar un documento
  deleteDocument: async (filename) => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar documento');
      }

      // Remover el documento de la lista local
      const { documents } = get();
      const updatedDocuments = documents.filter(doc => doc.filename !== filename);
      
      set({
        documents: updatedDocuments,
        loading: false
      });

      return { success: true };
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Formatear tamaño de archivo
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Formatear fecha
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}));

export default useDocumentStore;
