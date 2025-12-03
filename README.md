# Image to PDF Converter

A simple mobile-friendly web app that lets you select images from your phone, arrange them in order, rotate any that are sideways, and combine them all into a single PDF document.

**Everything happens in your browser — your photos never get uploaded anywhere.**

## Features

- **Select multiple images** - JPG, PNG, GIF, and WebP supported
- **Reorder images** - Move images up or down to arrange page order
- **Rotate images** - Fix sideways photos with 90° rotation
- **Custom filename** - Name your PDF before downloading
- **Privacy-focused** - All processing happens locally in your browser
- **Mobile-friendly** - Designed for easy use on phones and tablets

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

The built files will be in the `dist/` folder, ready to deploy to any static hosting service.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- jsPDF
- Lucide React (icons)
