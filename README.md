# Reddit Profile Picture Converter

Make a perfect Reddit avatar in seconds. Upload any image, crop to a circle, optionally remove the background with on-device AI, and export a crisp 256×256 WebP under 200KB.

## Features
- Drag & drop or file picker upload
- Round crop with live preview (react-easy-crop)
- Zoom via slider (scroll/pinch zoom disabled for precision)
- One-click "Make it fit" centered square crop
- Guaranteed 256×256 WebP export with adaptive compression to target < 200KB
- Dark mode with system preference + toggle
- Toast notifications (sonner) and accessible UI (shadcn/ui + Tailwind)

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS, shadcn/ui components
- next-themes (dark mode)
- react-easy-crop (cropping)
- @huggingface/transformers (background removal)

## Getting Started
<a href="https://reddit-pfp-maker.lovable.app" target="_blank" rel="noopener" 
   style="display:inline-block;padding:8px 14px;border-radius:8px;background:#2563EB;color:#fff;text-decoration:none;font-weight:600">
  🚀 Open Reddit PFP Maker
</a>



A lightweight and accessible tool to generate profile pictures for Reddit and other platforms.

---


## How to Use
1. Click "Choose File" (or drag & drop) to load an image.
2. Adjust the crop and use the Zoom slider as needed.
3. (Optional) Click "Remove Background (AI)". First run downloads the model (~10–20s, cached by the browser where possible).
4. Click "Make it fit" to auto-center a square crop.
5. Click "Download 256×256" to export a circular 256×256 WebP. The app adapts quality to stay under 200KB and warns if it can’t.
6. Use the sun/moon button (top-right) to toggle dark mode.

## Privacy & Performance
- All processing is in-browser. Images never leave your device.
- Background removal downloads a segmentation model from Hugging Face CDNs at runtime and executes locally (WebGPU preferred, falls back to WebGL/CPU when needed).
- Large images are resized to max 1024px on the longest side before segmentation for speed and memory efficiency.

## Accessibility
- Buttons and controls have accessible labels
- Keyboard- and screen reader-friendly components courtesy of Radix/shadcn

## Known Limits
- Extremely detailed or noisy images may exceed 200KB even after compression; the app will notify you.

## Contributing
Pull requests are welcome. Keep components small, use the design tokens in src/index.css, and prefer semantic HTML with one H1 per page.

## License
MIT

