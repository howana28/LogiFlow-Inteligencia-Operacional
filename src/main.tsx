import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { InventoryProvider } from './context/InventoryContext'
import { ReceivingProvider } from './context/ReceivingContext'
import { ReturnsProvider } from './context/ReturnsContext'
import './index.css'

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <BrowserRouter>
      <InventoryProvider>
        <ReturnsProvider>
          <ReceivingProvider>
            <App />
          </ReceivingProvider>
        </ReturnsProvider>
      </InventoryProvider>
    </BrowserRouter>
  </StrictMode>,
)
