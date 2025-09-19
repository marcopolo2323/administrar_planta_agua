// Z-Index personalizado para evitar conflictos de superposición
export const zIndices = {
  // Elementos básicos
  base: 1,
  content: 1,
  
  // Elementos flotantes
  dropdown: 100,
  sticky: 200,
  banner: 300,
  overlay: 400,
  
  // Navegación
  header: 999,
  sidebar: 1000,
  
  // Modales y popups
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  
  // Elementos de máxima prioridad
  notification: 1600,
  toast: 1700,
  skipLink: 1800
};

export default zIndices;
