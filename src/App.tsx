/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import Education from './pages/Education';
import TasSiaga from './pages/TasSiaga';
import Contacts from './pages/Contacts';
import EvacuationPlan from './pages/EvacuationPlan';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<MapPage />} />
          <Route path="education" element={<Education />} />
          <Route path="siaga" element={<TasSiaga />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="evacuation" element={<EvacuationPlan />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

