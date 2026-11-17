import { useState } from 'react';
import { ApiError, crearReserva } from '../api/reservasApi';

const INICIAL = { cliente: '', servicio: '', fechaHora: '' };

function Campo({ id, etiqueta, tipo = 'text', valor, onChange, error }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span id={`${id}-error`} className="campo-error">
          {error}
        </span>
      )}
    </div>
  );
}

export default function ReservaForm({ onCreada }) {
  const [datos, setDatos] = useState(INICIAL);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (evento) => {
    setDatos({ ...datos, [evento.target.name]: evento.target.value });
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    setErrores({});
    setMensaje(null);

    try {
      // datetime-local entrega "2027-01-10T10:30"; la API espera segundos
      const fechaHora = datos.fechaHora ? `${datos.fechaHora}:00` : '';
      const nueva = await crearReserva({ ...datos, fechaHora });
      setDatos(INICIAL);
      setMensaje({ tipo: 'ok', texto: `Reserva #${nueva.id} creada` });
      onCreada?.(nueva);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrores(error.validationErrors);
        setMensaje({ tipo: 'error', texto: error.message });
      } else {
        setMensaje({ tipo: 'error', texto: 'Ocurrió un error inesperado' });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="tarjeta" onSubmit={enviar} noValidate>
      <h2>Nueva reserva</h2>
      <Campo id="cliente" etiqueta="Cliente" valor={datos.cliente} onChange={cambiar} error={errores.cliente} />
      <Campo id="servicio" etiqueta="Servicio" valor={datos.servicio} onChange={cambiar} error={errores.servicio} />
      <Campo
        id="fechaHora"
        etiqueta="Fecha y hora"
        tipo="datetime-local"
        valor={datos.fechaHora}
        onChange={cambiar}
        error={errores.fechaHora}
      />
      <button type="submit" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Crear reserva'}
      </button>
      {mensaje && (
        <p
          className={`mensaje mensaje--${mensaje.tipo}`}
          role={mensaje.tipo === 'ok' ? 'status' : 'alert'}
        >
          {mensaje.texto}
        </p>
      )}
    </form>
  );
}