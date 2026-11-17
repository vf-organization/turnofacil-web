import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

const respuesta = (cuerpo) => ({ ok: true, status: 200, json: async () => cuerpo });

const reservas = [
  { id: 1, cliente: 'Ana', servicio: 'Corte', fechaHora: '2027-01-10T10:30:00', estado: 'pendiente' },
];

const apiSimulada = () =>
  vi.fn((url) => {
    if (url.startsWith('/api/health')) return Promise.resolve(respuesta({ status: 'UP' }));
    if (url.startsWith('/api/reservas')) return Promise.resolve(respuesta(reservas));
    return Promise.reject(new Error(`url inesperada: ${url}`));
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('muestra las reservas y el estado de la API', async () => {
    vi.stubGlobal('fetch', apiSimulada());

    render(<App />);

    expect(await screen.findByText('Ana')).toBeInTheDocument();
    expect(await screen.findByText(/activa/)).toBeInTheDocument();
  });

  it('filtra por estado consultando la API', async () => {
    const fetchMock = apiSimulada();
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);
    await screen.findByText('Ana');
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'confirmada' } });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/reservas?estado=confirmada', expect.anything()),
    );
  });

  it('avisa cuando la API no responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor');
    expect(await screen.findByText(/caída/)).toBeInTheDocument();
  });
});