import { useState, useEffect } from "react";
import Formulario from "./components/Formulario";
import Header from "./components/Header";
import ListadoClientes from "./components/ListadoClientes";

function App() {
  const Initial = JSON.parse(localStorage.getItem('clientes')) ?? []
  const [clientes, setClientes] = useState(Initial);
  const [cliente, setCliente] = useState({});

    useEffect(() => {
    localStorage.setItem('clientes', JSON.stringify( clientes ));
  }, [clientes])


  const eliminarId = (id) => {
    const clientesActualizados = clientes.filter(
      (variableTemporal) => variableTemporal.id !== id
    );
    setClientes(clientesActualizados);
  };

  return (
    <div className="my-8">
      <Header />
      <div className="mt-6 md:flex">
        <Formulario
          clientes={clientes}
          setClientes={setClientes}
          cliente={cliente}
          setCliente={setCliente}
        />
        <ListadoClientes
          clientes={clientes}
          setCliente={setCliente}
          eliminarId={eliminarId}
        />
      </div>
    </div>
  );
}

export default App;
