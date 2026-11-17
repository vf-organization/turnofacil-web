import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ReservaForm from '../components/ReservaForm';

const respuesta = (cuerpo, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => cuerpo,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ReservaForm', () => {
  it('envía los datos, avisa y limpia el formulario', async () => {
    const creada = { id: 7, cliente: 'Ana', servicio: 'Corte', fechaHora: '2027-01-10T10:30:00', estado: 'pendiente' };
    const fetchMock = vi.fn().mockResolvedValue(respuesta(creada, true, 201));
    vi.stubGlobal('fetch', fetchMock);
    const onCreada = vi.fn();

    render(<ReservaForm onCreada={onCreada} />);
    fireEvent.change(screen.getByLabelText('Cliente'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Servicio'), { target: { value: 'Corte' } });
    fireEvent.change(screen.getByLabelText('Fecha y hora'), { target: { value: '2027-01-10T10:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear reserva' }));

    expect(await screen.findByText('Reserva #7 creada')).toBeInTheDocument();
    await waitFor(() => expect(onCreada).toHaveBeenCalledWith(creada));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      cliente: 'Ana',
      servicio: 'Corte',
      fechaHora: '2027-01-10T10:30:00',
    });
    expect(screen.getByLabelText('Cliente')).toHaveValue('');
  });

  it('muestra los errores de validación que devuelve la API', async () => {
    const cuerpo = {
      message: 'Error de validación',
      validationErrors: { cliente: 'El cliente es obligatorio' },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(cuerpo, false, 400)));

    render(<ReservaForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Crear reserva' }));

    expect(await screen.findByText('El cliente es obligatorio')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Error de validación');
  });

  it('muestra un mensaje si no hay conexión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    render(<ReservaForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Crear reserva' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor');
  });
});