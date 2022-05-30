import React from "react";
import { useState, useEffect } from "react";

const Formulario = ({ clientes, setClientes, cliente, setCliente }) => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [error, setError] = useState(false);

  //Si di al boton de editar se activa este useEffect
  useEffect(() => {
    if (Object.keys(cliente).length > 0) {
      setNombre(cliente.nombre);
      setTelefono(cliente.telefono);
      setFecha(cliente.fecha);
      setHora(cliente.hora);
      setDescripcion(cliente.descripcion);
    }
  }, [cliente]);

  const handleSubmit = (evento) => {
    evento.preventDefault();
    if ([nombre, telefono, fecha, hora, descripcion].includes("")) {
      setError(true);
      return;
    }
    setError(false);

    const generarId = () => {
      const random = Math.random().toString(23).substring(2);
      const fecha = Date.now().toString(23);

      return random + fecha;
    };

    const nuevoCliente = {
      nombre,
      telefono,
      fecha,
      hora,
      descripcion
    };

    if (cliente.id) {
      //Editando el regsitro
      nuevoCliente.id = cliente.id;
      const clientesActualizados = clientes.map((clienteState) =>
        clienteState.id === cliente.id ? nuevoCliente : clienteState
      );

      setClientes(clientesActualizados);
      setCliente({});
    } else {
      //Nuevo regsitro
      nuevoCliente.id = generarId();
      setClientes([...clientes, nuevoCliente]);
    }

    setNombre("");
    setTelefono("");
    setFecha("");
    setHora("");
    setDescripcion("");
  };

  return (
    <div className="md:w-1/2 lg:2/5 mx-4">
      <h2 className="font-black text-3xl text-center">Clientes</h2>
      <p className="text-center my-2 font-bold">
        Añade clientes y adminsitralos
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg py-6 px-4 mt-10"
      >
        {error && (
          <div className="bg-red-600 w-full p-3 font-bold text-center">
            <p>Todos los campos son obligatorios</p>
          </div>
        )}
        <div>
          <label className="block p-2 font-bold uppercase" htmlFor="nombre">
            Nombre
          </label>
          <input
            className="border-2 w-full p-2 placeholder-slate-500"
            type="text"
            placeholder="Nombre del cliente"
            name=""
            id="nombre"
            value={nombre}
            onChange={(evento) => {
              setNombre(evento.target.value);
            }}
            //el id debe ser igual al htmlFor por temas de accesibilidad
          />
        </div>
        <div>
          <label className="block p-2 font-bold uppercase" htmlFor="email">
            Teléfono
          </label>
          <input
            className="border-2 w-full p-2 placeholder-slate-500"
            type="number"
            placeholder="Telefono del cliente"
            name=""
            id="telefono"
            value={telefono}
            onChange={(evento) => {
              setTelefono(evento.target.value);
            }}
          />
        </div>
        <div>
          <label className="block p-2 font-bold uppercase" htmlFor="fecha">
            Fecha
          </label>
          <input
            className="border-2 w-full p-2 placeholder-slate-500"
            type="date"
            placeholder="Fecha del turno"
            name=""
            id="fecha"
            value={fecha}
            onChange={(evento) => {
              setFecha(evento.target.value);
            }}
          />
        </div>
        <div>
          <label className="block p-2 font-bold uppercase" htmlFor="hora">
            Hora
          </label>
          <input
            className="border-2 w-full p-2 placeholder-slate-500"
            type="time"
            placeholder="Hora del turno"
            name=""
            id="hora"
            value={hora}
            onChange={(evento) => {
              setHora(evento.target.value);
            }}
          />
        </div>
        <div>
          <label
            className="block p-2 font-bold uppercase"
            htmlFor="descripcion"
          >
            Descripcion
          </label>
          <textarea
            className="border-2 w-full p-2 placeholder-slate-500"
            type="text"
            placeholder="Descripcion"
            name=""
            id="descripcion"
            value={descripcion}
            onChange={(evento) => {
              setDescripcion(evento.target.value);
            }}
          />
        </div>
        <input
          type="submit"
          className="bg-indigo-600 rounded-lg hover:bg-indigo-700 p-3 cursor-pointer my-4 transition-all w-full text-white uppercase font-bold"
          value={ (cliente.id) ? "Editar Turno" : "Agregar Turno"}
        />
      </form>
    </div>
  );
};

export default Formulario;
