import Projects from "@/app/components/Projects";

export default function ProjectsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-orange-400 mb-6">/projects</h1>

      <p className="text-orange-400/60 font-mono text-sm md:text-base">
        some selected projects that are publically available on my github
      </p>
      <Projects />
    </div>
  );
}
