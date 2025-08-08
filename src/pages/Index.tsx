import AvatarConverter from "@/components/AvatarConverter";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Reddit Profile Picture Converter";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Convert any image into a perfect Reddit profile picture: crop to circle, optional AI background removal, and export as transparent PNG.');
  }, []);

  return (
    <main className="container mx-auto max-w-5xl py-10">
      <AvatarConverter />
    </main>
  );
};

export default Index;
