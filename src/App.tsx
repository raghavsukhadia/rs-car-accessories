import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Services from './pages/Services';
import Requirements from './pages/Requirements';
import Settings from './pages/Settings';
import { RequireAuth } from './lib/RequireAuth';

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="services" element={<Services />} />
        <Route path="requirements" element={<Requirements />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;


