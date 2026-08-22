document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const btn = document.querySelectorAll(".game-card");
    btn.forEach((e) => {
      e.addEventListener("click", () => {
        // Corrección: Es "dataset" en minúscula
        const ruta = e.dataset.href;
        console.log(e, ruta);

        if (ruta) {
          // Opción A: Redirigir en la misma pestaña
          window.location.href = ruta;

          // Opción B: Si prefieres abrirlo en una pestaña nueva, usa esta línea en su lugar:
          // window.open(ruta, '_blank');
        }
      });
    });
  }, 200);
});
