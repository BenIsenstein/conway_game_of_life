import ReactDOM from 'react-dom/client'
import { App } from 'App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App xInit={100} yInit={100} />
)
