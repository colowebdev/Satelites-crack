const formRegistro = document.getElementById("formRegistro");
const mensaje = document.getElementById("mensaje");

formRegistro.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const clave = document.getElementById("clave").value;
  const confirmarClave = document.getElementById("confirmarClave").value;

  if (clave !== confirmarClave) {
    mensaje.textContent = "Las contraseñas no coinciden";
    mensaje.className = "mensaje error";
    return;
  }

  try {
    const respuesta = await fetch("/api/auth/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, correo, clave })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = datos.mensaje;
      mensaje.className = "mensaje error";
      return;
    }

    mensaje.textContent = "Cuenta creada. Redirigiendo al login...";
    mensaje.className = "mensaje exito";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  } catch (error) {
    mensaje.textContent = "Error de conexión con el servidor";
    mensaje.className = "mensaje error";
  }
});
