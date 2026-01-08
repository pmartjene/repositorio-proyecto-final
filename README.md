# Editor PiRètols

Editor para crear presupuestos con campos posicionados sobre una plantilla.

## Requisitos

- Node.js 18 o superior (https://nodejs.org/es))
- npm (viene con Node)
- Git, cualquier version (git-scm.com)

Para comprobar si tienes Node: `node --version`

## Cómo ejecutarlo

```bash
git clone https://github.com/pmartjene/repositorio-trabajo-final1.git
cd repositorio-trabajo-final1
npm install
npm run dev
```

Se abre en `http://localhost:5173`


## Stack

React + TypeScript + Vite + Tailwind.

## Estructura

```
src/
├── assets/           # plantillas e imágenes
├── components/       # componentes
│   ├── ui/          # botones, cards, etc (shadcn)
│   ├── FormEditor.tsx
│   ├── FormList.tsx
│   └── Dashboard.tsx
├── hooks/            # hooks custom
├── lib/              # utilidades
└── pages/            # páginas
```

## Datos

Todo se guarda en localStorage, por lo que, los datos son locales a cada navegador.

## Despliegue

```bash
npm run build
```

