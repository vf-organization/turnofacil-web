import { useEffect, useState } from 'react';
import { listarReservas } from './api/reservasApi';
import EstadoApi from './components/EstadoApi';
import ReservaForm from './components/ReservaForm';
import ReservaList from './components/ReservaList';

export default function App() {
  const [filtro, setFiltro] = useState('');
  const [version, setVersion] = useState(0);
  const [resultado, setResultado] = useState({ clave: null, reservas: [], error: null });

  // La "clave" identifica qué consulta estamos mostrando (filtro + recargas)
  const clave = `${filtro}|${version}`;
  const actual = resultado.clave === clave;

  useEffect(() => {
    let activo = true;

    listarReservas(filtro)
      .then((reservas) => {
        if (activo) setResultado({ clave, reservas, error: null });
      })
      .catch((error) => {
        if (activo) setResultado({ clave, reservas: [], error: error.message });
      });

    return () => {
      activo = false;
    };
  }, [clave, filtro]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>TurnoFácil</h1>
        <EstadoApi />
      </header>
      <main className="app-main">
        <ReservaForm onCreada={() => setVersion((v) => v + 1)} />
        <ReservaList
          reservas={resultado.reservas}
          filtro={filtro}
          onFiltroChange={setFiltro}
          cargando={!actual}
          error={actual ? resultado.error : null}
        />
      </main>
    </div>
  );
}