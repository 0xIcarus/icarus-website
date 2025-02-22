"use client";

export default function NASAPage() {
  return (
    <div className="flex justify-center items-center h-screen p-4">
      <iframe
        src="/nasa.pdf"
        className="w-full h-full max-w-4xl max-h-[90vh] border border-orange-500/20 shadow-lg shadow-black/50 rounded-lg"
      />
    </div>
  );
}
