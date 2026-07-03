# Curso CKA Web Local

Esta vista no modifica `CURSO-CKA-claude.txt`. El navegador carga ese archivo en tiempo real desde un servidor HTTP local.

## Abrir

Desde la raiz del proyecto:

```bash
bash cka-study-web/start.sh
```

Despues abre:

```text
http://127.0.0.1:8000/cka-study-web/
```

Si el puerto 8000 ya esta ocupado:

```bash
bash cka-study-web/start.sh 8010
```

## Actualizar contenido

Cuando agregues contenido a `CURSO-CKA-claude.txt`, refresca la pagina del navegador. La web vuelve a leer el TXT y reconstruye el indice, secciones, busqueda y bloques de comandos.

Abrir `index.html` directamente con doble click no carga el TXT porque el navegador bloquea lecturas locales desde paginas `file://`.
