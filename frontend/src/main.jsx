import 'bootstrap/dist/css/bootstrap.min.css';


import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { Provider } from 'react-redux'; // ✅ Add this
import store from './store';            // ✅ Import your store

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>          {/* ✅ Wrap App in Provider */}
      <App />
    </Provider>
  </StrictMode>
);

