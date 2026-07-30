const API_SATELITES = '/api/satelites';

const inputNombre = document.getElementById('nombre');
const inputPais = document.getElementById('pais');
const inputAgencia = document.getElementById('agencia');
const inputFecha = document.getElementById('fechaLanzamiento');
const inputOrbita = document.getElementById('tipoOrbita');
const inputObjetivo = document.getElementById('objetivo');
const inputMasa = document.getElementById('masaKg');
const selectEstado = document.getElementById('estado');

const btnGuardar = document.getElementById('btn-guardar');
const btnLimpiar = document.getElementById('btn-limpiar');
const btnCancelar = document.getElementById('btn-cancelar');
const listaSatelites = document.getElementById('lista-satelites');
const tablaSatelites = document.getElementById('tabla-satelites');
const sinSatelites = document.getElementById('sin-satelites');
const mensaje = document.getElementById('mensaje');
const modoEdicion = document.getElementById('modo-edicion');
const buscador = document.getElementById('buscador');
const filtroEstado = document.getElementById('filtroEstado');

let satelites = [];
let saliteEditandoId = null;


document.addEventListener('DOMContentLoaded', iniciarPagina);


async function iniciarPagina() {
  const sesionValida = await verificarSesion();
  if (!sesionValida) return;

  configurarEventos();
  await cargarSatelites();
}


function obtenerToken() {
  return localStorage.getItem('token');
}


function obtenerHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + obtenerToken()
  };
}


async function verificarSesion() {
  const token = obtenerToken();
  if (!token) {
    regresarAlLogin();
    return false;
  }

  try {
    const respuesta = await fetch('/api/verificatoken', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!respuesta.ok) {
      regresarAlLogin();
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error verificando la sesión:', error);
    regresarAlLogin();
    return false;
  }
}


function regresarAlLogin() {
  localStorage.removeItem('token');
  window.location.replace('login.html');
}


async function procesarRespuesta(respuesta) {
  if (respuesta.status === 401 || respuesta.status === 403) {
    regresarAlLogin();
    throw new Error('La sesión expiró');
  }

  let datos = {};
  try {
    datos = await respuesta.json();
  } catch (error) {
    datos = {};
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || 'No fue posible completar la operación');
  }
  return datos;
}


function configurarEventos() {
  btnGuardar.addEventListener('click', guardarSatelite);
  btnLimpiar.addEventListener('click', reiniciarFormulario);
  btnCancelar.addEventListener('click', reiniciarFormulario);
  buscador.addEventListener('input', renderizarSatelites);
  filtroEstado.addEventListener('change', renderizarSatelites);
}


function obtenerDatosFormulario() {
  return {
    nombre: inputNombre.value,
    pais: inputPais.value,
    agencia: inputAgencia.value,
    fechaLanzamiento: inputFecha.value,
    tipoOrbita: inputOrbita.value,
    objetivo: inputObjetivo.value,
    masaKg: Number(inputMasa.value),
    estado: selectEstado.value
  };
}


async function guardarSatelite() {
  try {
    btnGuardar.disabled = true;

    const datos = obtenerDatosFormulario();

    if (!datos.nombre || !datos.pais || !datos.agencia || !datos.fechaLanzamiento || !datos.tipoOrbita || !datos.objetivo || !datos.masaKg) {
      mostrarMensaje('Complete todos los campos antes de guardar.', true);
      return;
    }

    let url = API_SATELITES;
    let metodo = 'POST';

    if (saliteEditandoId) {
      url = API_SATELITES + '/' + saliteEditandoId;
      metodo = 'PUT';
    }

    const respuesta = await fetch(url, {
      method: metodo,
      headers: obtenerHeaders(),
      body: JSON.stringify(datos)
    });

    await procesarRespuesta(respuesta);

    mostrarMensaje(
      saliteEditandoId ? 'Satélite actualizado correctamente.' : 'Satélite guardado correctamente.'
    );

    reiniciarFormulario(false);
    await cargarSatelites();
  } catch (error) {
    console.error(error);
    mostrarMensaje(error.message, true);
  } finally {
    btnGuardar.disabled = false;
  }
}


async function cargarSatelites() {
  try {
    const respuesta = await fetch(API_SATELITES, {
      method: 'GET',
      headers: obtenerHeaders()
    });

    satelites = await procesarRespuesta(respuesta);
    renderizarSatelites();
  } catch (error) {
    console.error(error);
    mostrarMensaje(error.message, true);
  }
}


function renderizarSatelites() {
  const texto = buscador.value.toLowerCase();
  const estado = filtroEstado.value;

  const filtrados = satelites.filter((sat) => {
    const coincideTexto = sat.nombre.toLowerCase().includes(texto);
    const coincideEstado = estado === '' || sat.estado === estado;
    return coincideTexto && coincideEstado;
  });

  listaSatelites.replaceChildren();

  if (filtrados.length === 0) {
    tablaSatelites.classList.add('oculto');
    sinSatelites.classList.remove('oculto');
    return;
  }

  tablaSatelites.classList.remove('oculto');
  sinSatelites.classList.add('oculto');

  filtrados.forEach((sat) => {
    const fila = document.createElement('tr');

    fila.appendChild(crearCelda(sat.nombre));
    fila.appendChild(crearCelda(sat.pais));
    fila.appendChild(crearCelda(sat.agencia));
    fila.appendChild(crearCelda(sat.tipoOrbita));
    fila.appendChild(crearCelda(sat.objetivo));
    fila.appendChild(crearCelda(sat.masaKg));
    fila.appendChild(crearCelda(sat.estado));

    const celdaAcciones = document.createElement('td');
    const contenedorAcciones = document.createElement('div');
    contenedorAcciones.className = 'acciones';

    const btnEditar = document.createElement('button');
    btnEditar.type = 'button';
    btnEditar.className = 'btn-editar';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => editarSatelite(sat));

    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.className = 'btn-eliminar';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => eliminarSatelite(sat._id));

    contenedorAcciones.appendChild(btnEditar);
    contenedorAcciones.appendChild(btnEliminar);
    celdaAcciones.appendChild(contenedorAcciones);
    fila.appendChild(celdaAcciones);

    listaSatelites.appendChild(fila);
  });
}


function crearCelda(valor) {
  const celda = document.createElement('td');
  celda.textContent = valor;
  return celda;
}


function editarSatelite(sat) {
  saliteEditandoId = sat._id;

  inputNombre.value = sat.nombre;
  inputPais.value = sat.pais;
  inputAgencia.value = sat.agencia;
  inputFecha.value = sat.fechaLanzamiento ? sat.fechaLanzamiento.slice(0, 10) : '';
  inputOrbita.value = sat.tipoOrbita;
  inputObjetivo.value = sat.objetivo;
  inputMasa.value = sat.masaKg;
  selectEstado.value = sat.estado;

  btnGuardar.textContent = 'Actualizar satélite';
  btnCancelar.classList.remove('oculto');
  modoEdicion.classList.remove('oculto');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  mostrarMensaje('Puede modificar los datos del satélite.');
}


async function eliminarSatelite(id) {
  const confirmar = window.confirm('¿Está seguro de que desea eliminar este satélite?');
  if (!confirmar) return;

  try {
    const respuesta = await fetch(API_SATELITES + '/' + id, {
      method: 'DELETE',
      headers: obtenerHeaders()
    });

    const resultado = await procesarRespuesta(respuesta);

    if (saliteEditandoId === id) {
      reiniciarFormulario(false);
    }

    mostrarMensaje(resultado.mensaje || 'Satélite eliminado correctamente.');
    await cargarSatelites();
  } catch (error) {
    console.error(error);
    mostrarMensaje(error.message, true);
  }
}


function reiniciarFormulario(limpiarMensajeActual = true) {
  inputNombre.value = '';
  inputPais.value = '';
  inputAgencia.value = '';
  inputFecha.value = '';
  inputOrbita.value = '';
  inputObjetivo.value = '';
  inputMasa.value = '';
  selectEstado.value = 'Activo';

  saliteEditandoId = null;
  btnGuardar.textContent = 'Guardar satélite';
  btnCancelar.classList.add('oculto');
  modoEdicion.classList.add('oculto');

  if (limpiarMensajeActual) {
    limpiarMensaje();
  }
}


function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.className = esError ? 'mensaje-error' : 'mensaje-correcto';
}


function limpiarMensaje() {
  mensaje.textContent = '';
  mensaje.className = '';
}
