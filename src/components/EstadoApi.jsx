import { useEffect, useState } from 'react';
import { obtenerSalud } from '../api/reservasApi';

const ETIQUETAS = {
  verificando: 'verificando…',
  activa: 'activa',
  caida: 'caída',
};

export default function EstadoApi() {
  const [estado, setEstado] = useState('verificando');

  useEffect(() => {
    let activo = true;

    const verificar = async () => {
      try {
        const salud = await obtenerSalud();
        if (activo) setEstado(salud.status === 'UP' ? 'activa' : 'caida');
      } catch {
        if (activo) setEstado('caida');
      }
    };

    verificar();
    const intervalo = setInterval(verificar, 15000);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  return (
    <span className={`estado-api estado-api--${estado}`} role="status">
      API: {ETIQUETAS[estado]}
    </span>
  );
}