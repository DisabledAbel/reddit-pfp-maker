import React from "react";
import Cropper, { Area } from "react-easy-crop";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";


const DEFAULT_EXPORT = 256;

const fileToObjectURL = (file: Blob) => URL.createObjectURL(file);

export default function AvatarConverter() {
  const [imageURL, setImageURL] = React.useState<string | null>(null);
  const [imageEl, setImageEl] = React.useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(
    null
  );
  const [exportSize, setExportSize] = React.useState<number>(DEFAULT_EXPORT);
  
  const [spotlight, setSpotlight] = React.useState(false);
  

  const onCropComplete = React.useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const url = fileToObjectURL(file);
    setImageURL((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    try {
      const img = new Image();
      img.onload = () => {
        setImageEl(img);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        toast.success("Image loaded");
      };
      img.onerror = () => toast.error("Failed to load image");
      img.src = url;
    } catch (e) {
      toast.error("Failed to load image");
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };


  const getCroppedCanvas = async (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      try {
        if (!imageEl || !croppedAreaPixels) throw new Error("No image/crop");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("No canvas ctx");

        const size = exportSize;
        canvas.width = size;
        canvas.height = size;

        // Create circular mask
        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw the cropped image into the circle
        const { x, y, width, height } = croppedAreaPixels;
        ctx.drawImage(
          imageEl,
          x,
          y,
          width,
          height,
          0,
          0,
          size,
          size
        );

        ctx.restore();
        resolve(canvas);
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleDownload = async () => {
    try {
      if (!imageURL || !imageEl || !croppedAreaPixels) {
        toast.error("Upload and crop an image first");
        return;
      }
      const canvas = await getCroppedCanvas();

      const targetBytes = 200 * 1024; // 200KB
      const qualities = [0.92, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35];

      const toBlob = (q: number) =>
        new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/webp", q)
        );

      let finalBlob: Blob | null = null;
      for (const q of qualities) {
        const b = await toBlob(q);
        if (!b) continue;
        finalBlob = b;
        if (b.size <= targetBytes) break;
      }

      if (!finalBlob) return toast.error("Export failed");

      if (finalBlob.size > targetBytes) {
        toast.message(
          `Compressed to ${Math.round(finalBlob.size / 1024)}KB (over 200KB). Try a simpler image.`
        );
      }

      const link = document.createElement("a");
      link.download = `reddit-pfp-256.webp`;
      link.href = URL.createObjectURL(finalBlob);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Downloaded");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const reset = () => {
    if (imageURL) URL.revokeObjectURL(imageURL);
    setImageURL(null);
    setImageEl(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
  };

  const makeItFit = () => {
    if (!imageEl) {
      toast.error("Upload an image first");
      return;
    }
    const w = imageEl.naturalWidth;
    const h = imageEl.naturalHeight;
    const side = Math.min(w, h);
    const x = Math.floor((w - side) / 2);
    const y = Math.floor((h - side) / 2);

    setCroppedAreaPixels({ x, y, width: side, height: side });
    setExportSize(256);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    toast.success("Centered crop set — ready to download 256×256");
  };

  return (
    <div className="space-y-8">
      <section className="app-hero rounded-xl p-8 text-center text-primary-foreground">
        <h1 className="text-4xl font-extrabold tracking-tight">Reddit Profile Picture Converter</h1>
        <p className="mt-2 text-sm/6 opacity-90">
          Upload, crop to a perfect circle, and export as a crisp PNG.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-elev">
          <CardHeader>
            <CardTitle>Upload & Adjust</CardTitle>
            <CardDescription>
              Square crop recommended. Export is 256×256 (under 200KB).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!imageURL ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed"
                aria-label="Upload image dropzone"
              >
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Drag & drop an image here</p>
                  <div className="mt-3">
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      onChange={onInputChange}
                      className="hidden"
                    />
                    <Button asChild>
                      <label htmlFor="file-input" className="cursor-pointer">Choose File</label>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto aspect-square w-full max-w-md overflow-hidden rounded-lg border">
                  <div className="relative h-full w-full">
                    <Cropper
                      image={imageURL}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      cropShape="round"
                      showGrid={false}
                      zoomWithScroll={false}
                    />
                    {spotlight && (
                      <div className="pointer-events-none absolute inset-0">
                        <div
                          className="absolute inset-0 transition-opacity duration-200"
                          style={{
                            background:
                              "radial-gradient(circle at 50% 50%, transparent 40%, hsl(var(--background) / 0.82) 45%)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">Zoom</label>
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.01}
                    onValueChange={([v]) => setZoom(v)}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <label htmlFor="spotlight" className="text-sm font-medium">
                    Spotlight mode
                  </label>
                  <Switch id="spotlight" checked={spotlight} onCheckedChange={setSpotlight} />
                </div>

              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap items-center gap-3">

            <Button
              variant="secondary"
              onClick={reset}
              disabled={!imageURL}
            >
              Reset
            </Button>

            <Button onClick={makeItFit} disabled={!imageURL}>
              Make it fit
            </Button>

            <Button onClick={handleDownload} disabled={!imageURL}>
              Download 256×256
            </Button>

          </CardFooter>
        </Card>

        <Card className="card-elev flex items-center justify-center p-6">
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">Live Reddit-style preview</p>
            <div className="mx-auto grid place-items-center">
              <div
                className="relative h-40 w-40 rounded-full border bg-muted shadow-sm"
                aria-label="Avatar preview"
              >
                {/* Decorative ring */}
                <div className="pointer-events-none absolute -inset-1 rounded-full opacity-80" style={{
                  background: "radial-gradient(closest-side, hsl(var(--brand)/0.35), transparent)"
                }} />
                {/* Circle mask with image */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  {imageURL ? (
                    <img
                      src={imageURL}
                      alt="Uploaded avatar preview"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-muted-foreground">
                      <span className="text-xs">Your avatar here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Export is a 256×256 WebP (with transparency) masked to a perfect circle.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
