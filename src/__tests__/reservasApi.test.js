import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  crearReserva,
  listarReservas,
  obtenerReserva,
  obtenerSalud,
} from '../api/reservasApi';

const respuesta = (cuerpo, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => cuerpo,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('reservasApi', () => {
  it('lista todas las reservas', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta([{ id: 1 }]));
    vi.stubGlobal('fetch', fetchMock);

    const datos = await listarReservas();

    expect(datos).toEqual([{ id: 1 }]);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/reservas');
  });

  it('filtra por estado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta([]));
    vi.stubGlobal('fetch', fetchMock);

    await listarReservas('pendiente');

    expect(fetchMock.mock.calls[0][0]).toBe('/api/reservas?estado=pendiente');
  });

  it('obtiene una reserva por id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta({ id: 5 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await obtenerReserva(5)).toEqual({ id: 5 });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/reservas/5');
  });

  it('crea una reserva con POST y JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta({ id: 2 }, true, 201));
    vi.stubGlobal('fetch', fetchMock);
    const datos = { cliente: 'Ana', servicio: 'Corte', fechaHora: '2027-01-10T10:30:00' };

    await crearReserva(datos);

    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/reservas');
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toEqual(datos);
  });

  it('consulta el health', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({ status: 'UP' })));

    expect(await obtenerSalud()).toEqual({ status: 'UP' });
  });

  it('lanza ApiError con los errores de validación', async () => {
    const cuerpo = { message: 'Datos inválidos', validationErrors: { cliente: 'obligatorio' } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(cuerpo, false, 400)));

    const promesa = crearReserva({});

    await expect(promesa).rejects.toBeInstanceOf(ApiError);
    await expect(promesa).rejects.toMatchObject({
      status: 400,
      message: 'Datos inválidos',
      validationErrors: { cliente: 'obligatorio' },
    });
  });

  it('usa un mensaje genérico si el error no trae JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('sin json');
        },
      }),
    );

    await expect(listarReservas()).rejects.toMatchObject({ status: 500, message: 'Error 500' });
  });

  it('lanza ApiError con status 0 si no hay red', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    await expect(listarReservas()).rejects.toMatchObject({ status: 0 });
  });
});