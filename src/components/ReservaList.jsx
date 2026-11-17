const ESTADOS = ['pendiente', 'confirmada', 'cancelada'];

const formatearFecha = (iso) =>
  new Date(iso).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });

export default function ReservaList({ reservas, filtro, onFiltroChange, cargando, error }) {
  return (
    <section className="tarjeta" aria-labelledby="titulo-lista">
      <div className="lista-encabezado">
        <h2 id="titulo-lista">Reservas</h2>
        <div className="filtro">
          <label htmlFor="filtro">Estado</label>
          <select id="filtro" value={filtro} onChange={(e) => onFiltroChange(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mensaje mensaje--error" role="alert">
          {error}
        </p>
      )}
      {cargando && <p>Cargando…</p>}
      {!cargando && !error && reservas.length === 0 && <p>No hay reservas.</p>}

      {!cargando && reservas.length > 0 && (
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Fecha y hora</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>{reserva.cliente}</td>
                  <td>{reserva.servicio}</td>
                  <td>{formatearFecha(reserva.fechaHora)}</td>
                  <td>
                    <span className={`insignia insignia--${reserva.estado}`}>{reserva.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}