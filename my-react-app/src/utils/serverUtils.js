/**
 * Server utilities to help manage React development server instances
 * These functions can be used from within the application to check server status
 * and also to track server instance information in localStorage
 */

/**
 * Store server information in localStorage to help identify
 * and track server instances across browser sessions
 * @param {Object} serverInfo Server instance information
 */
export const storeServerInstance = (serverInfo = {}) => {
  const timestamp = new Date().toISOString();
  
  // Generate a server ID if not provided
  const serverId = serverInfo.id || `server-${timestamp}`;
  
  const instanceData = {
    id: serverId,
    startedAt: timestamp,
    port: serverInfo.port || window.location.port || '3000',
    ...serverInfo
  };
  
  // Store in localStorage
  localStorage.setItem('currentServer', JSON.stringify(instanceData));
  
  // Also maintain a history of server instances
  const serverHistory = JSON.parse(localStorage.getItem('serverHistory') || '[]');
  serverHistory.push(instanceData);
  
  // Keep only last 5 instances
  if (serverHistory.length > 5) {
    serverHistory.shift();
  }
  
  localStorage.setItem('serverHistory', JSON.stringify(serverHistory));
  
  return instanceData;
};

/**
 * Get information about the current server instance
 * @returns {Object|null} Current server instance data or null if not available
 */
export const getCurrentServer = () => {
  const serverData = localStorage.getItem('currentServer');
  return serverData ? JSON.parse(serverData) : null;
};

/**
 * Get history of recent server instances
 * @returns {Array} Array of server instance data objects
 */
export const getServerHistory = () => {
  return JSON.parse(localStorage.getItem('serverHistory') || '[]');
};

/**
 * Check if this appears to be a new server instance
 * Compares current URL port with stored server port
 * @returns {boolean} True if this appears to be a different server
 */
export const isNewServerInstance = () => {
  const currentServer = getCurrentServer();
  
  // If no server info stored, this is a new instance
  if (!currentServer) {
    return true;
  }
  
  // Check if current port matches stored port
  const currentPort = window.location.port || '3000';
  return currentPort !== currentServer.port;
};

/**
 * Initialize tracking for this server instance
 * Called on application startup to help track server instances
 */
export const initializeServerTracking = () => {
  const isNew = isNewServerInstance();
  
  // If this is a new instance, store its information
  if (isNew) {
    storeServerInstance({
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Log to console for debugging
    console.info('New server instance detected and tracked');
  }
  
  return isNew;
};