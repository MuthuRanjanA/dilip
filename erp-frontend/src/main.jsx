import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import "./index.css"
import { ToastProvider} from "./components/common/ToastContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
       <ToastProvider>

      <App />

    </ToastProvider>
  </React.StrictMode>
)