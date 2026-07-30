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
