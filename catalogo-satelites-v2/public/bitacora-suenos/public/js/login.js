const formLogin = document.getElementById("formLogin");
const mensaje = document.getElementById("mensaje");

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const correo = document.getElementById("correo").value;
  const clave = document.getElementById("clave").value;

  try {
    const respuesta = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, clave })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = datos.mensaje;
      mensaje.className = "mensaje error";
      return;
    }

    localStorage.setItem("token", datos.token);
    localStorage.setItem("nombreUsuario", datos.usuario.nombre);

    mensaje.textContent = "Bienvenido de nuevo";
    mensaje.className = "mensaje exito";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
  } catch (error) {
    mensaje.textContent = "Error de conexión con el servidor";
    mensaje.className = "mensaje error";
  }
});
