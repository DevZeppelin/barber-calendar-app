import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import DashboardView from "./components/dashboard/DashboardView";
import AgendaView from "./components/agenda/AgendaView";
import ClientesView from "./components/clientes/ClientesView";
import RecordatoriosView from "./components/recordatorios/RecordatoriosView";
import ServiciosView from "./components/servicios/ServiciosView";
import AjustesView from "./components/ajustes/AjustesView";
import { DataProvider } from "./context/DataContext";

function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardView />} />
            <Route path="agenda" element={<AgendaView />} />
            <Route path="clientes" element={<ClientesView />} />
            <Route path="recordatorios" element={<RecordatoriosView />} />
            <Route path="servicios" element={<ServiciosView />} />
            <Route path="ajustes" element={<AjustesView />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  );
}

export default App;
