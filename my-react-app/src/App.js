import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import HomeAssessmentTool from './HomeAssessmentTool';
import { getCurrentServer, getServerHistory, isNewServerInstance } from './utils/serverUtils';

function App() {
  useEffect(() => {
    // Check if multiple server instances detected
    const serverHistory = getServerHistory();
    const isNewServer = isNewServerInstance();
    
    if (serverHistory.length > 1 && isNewServer) {
      const currentServer = getCurrentServer();
      
      // Show warning toast about multiple servers
      toast.warning(
        <div>
          <p><strong>Multiple development servers detected</strong></p>
          <p>Current server: Port {currentServer?.port || window.location.port}</p>
          <p>Use <code>npm run stop</code> to stop unused servers</p>
        </div>,
        {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        }
      );
    }
  }, []);

  return (
    <div className="App">
      <HomeAssessmentTool />
      <ToastContainer />
    </div>
  );
}

export default App;
