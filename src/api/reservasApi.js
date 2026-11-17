const BASE = '/api';

export class ApiError extends Error {
  constructor(message, status, validationErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }

  if (!response.ok) {
    let cuerpo = {};
    try {
      cuerpo = await response.json();
    } catch {
      // la respuesta de error no traía JSON
    }
    throw new ApiError(
      cuerpo.message || `Error ${response.status}`,
      response.status,
      cuerpo.validationErrors || {},
    );
  }
  return response.json();
}

export const obtenerSalud = () => request('/health');

export const listarReservas = (estado) =>
  request(estado ? `/reservas?estado=${encodeURIComponent(estado)}` : '/reservas');

export const obtenerReserva = (id) => request(`/reservas/${id}`);

export const crearReserva = (datos) =>
  request('/reservas', { method: 'POST', body: JSON.stringify(datos) });