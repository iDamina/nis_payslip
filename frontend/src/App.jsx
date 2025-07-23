import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Forbidden from './pages/Forbidden';
import PayslipSearch from './components/PayslipSearch';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* 👤 Regular user route */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <PayslipSearch />
            </PrivateRoute>
          }
        />

        {/* 🛡 Admin-only route */}
        <Route
          path="/admin"
          element={
            <PrivateRoute adminOnly={true}>
              <Admin />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;