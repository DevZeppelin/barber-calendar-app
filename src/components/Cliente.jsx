
const Cliente = ({ clienteItem, setCliente, eliminarId }) => {

  const { nombre, telefono, fecha, hora, descripcion, id } = clienteItem;

  const handleEliminar = () => {
    console.log(id)
    const respuesta = confirm('¿Desea eliminar este turno?')
    if (respuesta){ eliminarId(id) }
  }

  return (
    <div className="shadow-md mx-3 mb-4 text-white p-3 rounded-xl bg-gray-500 border-2 border-orange-500">
      <p className="font-bold mb-3 uppercase">
        Nombre: <span className="font-normal normal-case">{nombre}</span>
      </p>
      <p className="font-bold mb-3 uppercase">
        Telefono: <span className="font-normal normal-case">{telefono}</span>
      </p>
      <p className="font-bold mb-3 uppercase">
        Fecha: <span className="font-normal normal-case">{fecha}</span>
      </p>
      <p className="font-bold mb-3 uppercase">
        Hora: <span className="font-normal normal-case">{hora}</span>
      </p>
      <p className="font-bold mb-3 uppercase">
        Descripcion:{" "}
        <span className="font-normal normal-case">{descripcion}</span>
      </p>

      <div className="flex justify-center mt-10">
        <button onClick={()=>(setCliente(clienteItem))} type="button" className="uppercase p-3 mr-4 font-bold bg-orange-500 rounded-lg text-white">Editar</button>

        <button onClick={handleEliminar} type="button" className="uppercase p-3 font-bold bg-red-700 rounded-lg text-white">Eliminar</button>
        
      </div>
    </div>
  );
};

export default Cliente;
