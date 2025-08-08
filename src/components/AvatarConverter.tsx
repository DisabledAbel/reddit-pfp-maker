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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { removeBackground, loadImage } from "@/lib/backgroundRemoval";

const DEFAULT_EXPORT = 512;

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
  const [processing, setProcessing] = React.useState(false);

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
      const img = await loadImage(file);
      setImageEl(img);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      toast.success("Image loaded");
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

  const handleRemoveBg = async () => {
    if (!imageEl) return;
    setProcessing(true);
    toast.message("Removing background… this may take ~10–20s");
    try {
      const blob = await removeBackground(imageEl);
      const url = fileToObjectURL(blob);
      setImageURL((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      const img = await loadImage(blob);
      setImageEl(img);
      toast.success("Background removed");
    } catch (e) {
      toast.error("Background removal failed");
    } finally {
      setProcessing(false);
    }
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
      canvas.toBlob((blob) => {
        if (!blob) return toast.error("Export failed");
        const link = document.createElement("a");
        link.download = `reddit-pfp-${exportSize}.png`;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Downloaded");
      }, "image/png");
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
          Upload, crop to a perfect circle, optionally remove background, and export as a crisp PNG.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-elev">
          <CardHeader>
            <CardTitle>Upload & Adjust</CardTitle>
            <CardDescription>
              Square crop recommended. Export sizes: 256 or 512 for best results.
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
                    />
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
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap items-center gap-3">
            <Select
              value={String(exportSize)}
              onValueChange={(v) => setExportSize(parseInt(v))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Export size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="256">256 x 256</SelectItem>
                <SelectItem value="512">512 x 512</SelectItem>
                <SelectItem value="1024">1024 x 1024</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="secondary"
              onClick={reset}
              disabled={!imageURL || processing}
            >
              Reset
            </Button>

            <Button onClick={makeItFit} disabled={!imageURL || processing}>
              Make it fit
            </Button>

            <Button onClick={handleDownload} disabled={!imageURL || processing}>
              Download PNG
            </Button>

            <Button
              variant="outline"
              onClick={handleRemoveBg}
              disabled={!imageURL || processing}
            >
              {processing ? "Processing…" : "Remove Background (AI)"}
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
            <p className="text-xs text-muted-foreground">Export is a transparent PNG masked to a perfect circle.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
