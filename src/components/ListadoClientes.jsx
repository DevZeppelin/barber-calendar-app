import Cliente from "./Cliente";

const ListadoClientes = ({ clientes, setCliente, eliminarId }) => {
  return (
    <div className="md:w-1/2  sm:pt-10 md:pt-0 ">
      <h2 className="font-black text-3xl text-center text-orange-600">Listado clientes</h2>
      <p className="mb-10 my-2 text-center font-bold text-white">Adminsitra tus turnos</p>
      <div className=" md:h-screen overflow-y-scroll">
        {clientes.length === 0 ? (
          <p className="bg-green-600 font-bold text-center p-3 m-3 rounded-xl">
            No hay turnos cargados
          </p>
        ) : (
          clientes.map((clienteItem) => (
            <Cliente
              setCliente={setCliente}
              clienteItem={clienteItem}
              key={clienteItem.id}
              eliminarId={eliminarId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ListadoClientes;
