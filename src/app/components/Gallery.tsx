"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import IconWrapper from "./IconWrapper";

type ImageData = {
  src: string;
  caption: string;
};

export default function Gallery() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/gallery.json")
      .then((res) => res.json())
      .then((data) => {
        setImages([...data].reverse());
        setIsLoading(false);
      })
      .catch((err) => console.error("Failed to load images:", err));
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
        <div className="text-center text-orange-400 font-mono text-3xl animate-fade-up">
          Loading...
        </div>
      </div>
    );
  }

  const openImage = (index: number) => setSelectedIndex(index);
  const closeImage = () => setSelectedIndex(null);
  const prevImage = () =>
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev! - 1));
  const nextImage = () =>
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev! + 1));

  return (
    <div className="min-h-screen py-8">
      <div
        className="text-left mb-12 opacity-0 animate-fade-down"
        style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
      >
        <h1 className="text-4xl md:text-5xl text-orange-400 font-mono tracking-tight mb-3">
          /photos
        </h1>
        <p className="text-orange-400/60 font-mono text-sm md:text-base">
          cool things i see irl
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {images.map((img, index) => (
          <div
            key={index}
            className={`relative flex justify-center items-center border border-orange-500/20 shadow-lg shadow-black/50 rounded-lg overflow-hidden aspect-[4/3] opacity-0 animate-fade-up group`}
            style={{
              animationDelay: `${index * 100 + 400}ms`,
              animationFillMode: "forwards",
            }}
          >
            <div className="absolute inset-0">
              <Image
                src={img.src}
                alt=""
                fill
                className="object-cover blur-md brightness-75 scale-105"
                priority={false}
              />
            </div>

            <div className="relative z-10">
              <Image
                src={img.src}
                alt={img.caption}
                width={400}
                height={300}
                className="max-w-full max-h-full object-contain cursor-pointer transition duration-300 transform group-hover:scale-105"
                onClick={() => openImage(index)}
              />
            </div>

            <div className="absolute bottom-0 left-0 w-full bg-black/40 p-2 text-center text-orange-400 text-sm backdrop-blur-sm z-20 transition-all duration-300 group-hover:bg-black/60 group-hover:backdrop-blur-md font-mono">
              {img.caption}
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/0 flex items-center justify-center z-50 animate-fade-in"
          onClick={closeImage}
        >
          <div
            className="absolute inset-0 bg-black/80 animate-fade-in"
            style={{ animationDuration: "400ms" }}
          />

          <button
            className="absolute top-4 right-4 text-orange-400 hover:text-white transition-colors duration-300 animate-fade-down"
            onClick={closeImage}
          >
            <IconWrapper>
              <X size={32} />
            </IconWrapper>
          </button>

          <button
            className="absolute left-4 text-orange-400 hover:text-white transition-colors duration-300 opacity-0 hover:bg-black/20 rounded-full p-2 animate-slide-right"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <IconWrapper>
              <ChevronLeft size={48} />
            </IconWrapper>
          </button>

          <div
            className="relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedIndex].src}
              alt={images[selectedIndex].caption}
              width={800}
              height={600}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            />

            <div className="absolute bottom-0 left-0 w-full bg-black/40 p-2 text-center text-orange-400 text-sm backdrop-blur-sm rounded-b-lg font-mono">
              {images[selectedIndex].caption}
            </div>
          </div>

          <button
            className="absolute right-4 text-orange-400 hover:text-white transition-colors duration-300 opacity-0 hover:bg-black/20 rounded-full p-2 animate-slide-left"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <IconWrapper>
              <ChevronRight size={48} />
            </IconWrapper>
          </button>
        </div>
      )}
    </div>
  );
}
