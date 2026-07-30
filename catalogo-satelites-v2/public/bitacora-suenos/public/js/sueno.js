const token = localStorage.getItem("token");
const nombreUsuario = localStorage.getItem("nombreUsuario");

if (!token) {
  window.location.href = "login.html";
}

document.getElementById("saludoUsuario").textContent = `Hola, ${nombreUsuario || "invitado"}`;

document.getElementById("btnSalir").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("nombreUsuario");
  window.location.href = "login.html";
});

const formSueno = document.getElementById("formSueno");
const listaSuenos = document.getElementById("listaSuenos");
const buscador = document.getElementById("buscador");
const filtroTipo = document.getElementById("filtroTipo");
const btnCancelar = document.getElementById("btnCancelar");
const btnOrdenar = document.getElementById("btnOrdenar");
const tituloFormulario = document.getElementById("tituloFormulario");

let todosLosSuenos = [];
let ordenAscendente = false;

async function cargarSuenos() {
  try {
    const respuesta = await fetch("/api/suenos", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (respuesta.status === 401) {
      window.location.href = "login.html";
      return;
    }

    todosLosSuenos = await respuesta.json();
    renderizarSuenos();
  } catch (error) {
    listaSuenos.innerHTML = `<p class="vacio">No se pudo conectar con el servidor</p>`;
  }
}

function renderizarSuenos() {
  let datos = [...todosLosSuenos];

  const textoBusqueda = buscador.value.trim().toLowerCase();
  if (textoBusqueda) {
    datos = datos.filter((s) => s.titulo && s.titulo.toLowerCase().includes(textoBusqueda));
  }

  const tipoSeleccionado = filtroTipo.value;
  if (tipoSeleccionado) {
    datos = datos.filter((s) => s.tipo === tipoSeleccionado);
  }

  datos.sort((a, b) => {
    const fechaA = new Date(a.fecha).getTime();
    const fechaB = new Date(b.fecha).getTime();
    return ordenAscendente ? fechaA - fechaB : fechaB - fechaA;
  });

  if (datos.length === 0) {
    listaSuenos.innerHTML = `<p class="vacio">Aún no hay sueños que coincidan con la búsqueda</p>`;
    return;
  }

  listaSuenos.innerHTML = datos.map((sueno) => crearTarjetaHTML(sueno)).join("");

  document.querySelectorAll(".btn-editar").forEach((boton) => {
    boton.addEventListener("click", () => cargarEnFormulario(boton.dataset.id));
  });

  document.querySelectorAll(".btn-eliminar").forEach((boton) => {
    boton.addEventListener("click", () => eliminarSueno(boton.dataset.id));
  });
}

function crearTarjetaHTML(sueno) {
  const fecha = sueno.fecha
    ? new Date(sueno.fecha).toLocaleDateString("es-CR", { year: "numeric", month: "short", day: "numeric" })
    : "Sin fecha";

  const claridad = Number(sueno.nivelClaridad) || 0;
  const claridadPorcentaje = Math.min(Math.max(claridad, 0), 10) * 10;

  return `
    <div class="tarjeta-sueno ${sueno.recurrente ? "recurrente" : ""}">
      <h3>${escaparHTML(sueno.titulo || "Sin título")}</h3>
      <div class="fecha-tipo">${fecha} · <span class="tipo-tag">${escaparHTML(sueno.tipo || "Normal")}</span></div>
      <p class="desc">${escaparHTML(sueno.descripcion || "Sin descripción")}</p>

      <div class="detalle-linea"><span>Emoción</span><span>${escaparHTML(sueno.emocionPrincipal || "-")}</span></div>
      <div class="detalle-linea"><span>Persona</span><span>${escaparHTML(sueno.personaPrincipal || "-")}</span></div>
      <div class="detalle-linea"><span>Lugar</span><span>${escaparHTML(sueno.lugarPrincipal || "-")}</span></div>

      <div class="claridad-barra">
        <div class="claridad-relleno" style="width:${claridadPorcentaje}%"></div>
      </div>

      <div class="acciones-tarjeta">
        <button class="btn-editar" data-id="${sueno._id}">Editar</button>
        <button class="btn-eliminar eliminar" data-id="${sueno._id}">Eliminar</button>
      </div>
    </div>
  `;
}

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

formSueno.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const id = document.getElementById("suenoId").value;

  const cuerpo = {
    titulo: document.getElementById("titulo").value,
    fecha: document.getElementById("fecha").value,
    tipo: document.getElementById("tipo").value,
    descripcion: document.getElementById("descripcion").value,
    emocionPrincipal: document.getElementById("emocionPrincipal").value,
    personaPrincipal: document.getElementById("personaPrincipal").value,
    lugarPrincipal: document.getElementById("lugarPrincipal").value,
    nivelClaridad: Number(document.getElementById("nivelClaridad").value),
    recurrente: document.getElementById("recurrente").checked
  };

  const url = id ? `/api/suenos/${id}` : "/api/suenos";
  const metodo = id ? "PUT" : "POST";

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cuerpo)
    });

    if (respuesta.status === 401) {
      window.location.href = "login.html";
      return;
    }

    if (!respuesta.ok) {
      alert("Ocurrió un error al guardar el sueño");
      return;
    }

    limpiarFormulario();
    cargarSuenos();
  } catch (error) {
    alert("No se pudo conectar con el servidor");
  }
});

function cargarEnFormulario(id) {
  const sueno = todosLosSuenos.find((s) => s._id === id);
  if (!sueno) return;

  document.getElementById("suenoId").value = sueno._id;
  document.getElementById("titulo").value = sueno.titulo || "";
  document.getElementById("fecha").value = sueno.fecha ? sueno.fecha.substring(0, 10) : "";
  document.getElementById("tipo").value = sueno.tipo || "Normal";
  document.getElementById("descripcion").value = sueno.descripcion || "";
  document.getElementById("emocionPrincipal").value = sueno.emocionPrincipal || "";
  document.getElementById("personaPrincipal").value = sueno.personaPrincipal || "";
  document.getElementById("lugarPrincipal").value = sueno.lugarPrincipal || "";
  document.getElementById("nivelClaridad").value = sueno.nivelClaridad || "";
  document.getElementById("recurrente").checked = !!sueno.recurrente;

  tituloFormulario.textContent = "Editar sueño";
  btnCancelar.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

btnCancelar.addEventListener("click", () => {
  limpiarFormulario();
});

function limpiarFormulario() {
  formSueno.reset();
  document.getElementById("suenoId").value = "";
  tituloFormulario.textContent = "Nuevo sueño";
  btnCancelar.style.display = "none";
}

async function eliminarSueno(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este sueño?");
  if (!confirmar) return;

  try {
    const respuesta = await fetch(`/api/suenos/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (respuesta.status === 401) {
      window.location.href = "login.html";
      return;
    }

    cargarSuenos();
  } catch (error) {
    alert("No se pudo eliminar el sueño");
  }
}

buscador.addEventListener("input", renderizarSuenos);
filtroTipo.addEventListener("change", renderizarSuenos);

btnOrdenar.addEventListener("click", () => {
  ordenAscendente = !ordenAscendente;
  btnOrdenar.textContent = ordenAscendente ? "Ordenar: más antiguos" : "Ordenar: más recientes";
  renderizarSuenos();
});

cargarSuenos();
