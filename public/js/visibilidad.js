function puedeVerImagen(imagen, visitante, autor) {
  // 1. Pública: todos pueden verla
  if (imagen.visibilidad === "publica") return true;

  // 2. Visitante no logueado: no puede ver privadas
  if (!visitante) return false;

  // 3. Dueño de la imagen: siempre puede ver
  if (visitante.id === autor.id) return true;

  // 4. Privada para todos los seguidores
  if (imagen.visibilidad === "privada_todos") {
    return visitante.amigos?.includes(autor.id) || false;
  }

  // 5. Privada con destinatarios seleccionados
  if (imagen.visibilidad === "privada_select") {
    return (
      Array.isArray(imagen.destinatarios) &&
      imagen.destinatarios.includes(visitante.id)
    );
  }

  return false;
}
