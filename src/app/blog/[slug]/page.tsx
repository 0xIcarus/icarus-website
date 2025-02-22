import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { marked } from "marked";

interface BlogPost {
  title: string;
  date: string;
  content: string;
}

function getBlogPost(slug: string): BlogPost | null {
  try {
    const markdownFile = fs.readFileSync(
      path.join(process.cwd(), "public/blog", slug, "index.md"),
      "utf-8",
    );
    const { data: frontmatter, content } = matter(markdownFile);
    return {
      title: frontmatter.title,
      date: frontmatter.date,
      content: content,
    };
  } catch (e) {
    console.error("Error reading blog post", e);
    return null;
  }
}

export async function generateStaticParams() {
  const blogDir = path.join(process.cwd(), "public/blog");
  const slugs = fs.readdirSync(blogDir).filter((dir) => {
    const dirPath = path.join(blogDir, dir);
    return (
      fs.statSync(dirPath).isDirectory() &&
      fs.existsSync(path.join(dirPath, "index.md"))
    );
  });
  return slugs.map((slug) => ({
    slug,
  }));
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPost({ params }: PageProps) {
  const resolvedParams = await params;
  const post = getBlogPost(resolvedParams.slug);
  if (!post) {
    notFound();
  }
  const htmlContent = marked(post.content);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="text-left border border-orange-500/20 p-6 rounded-lg shadow-lg shadow-black/50 backdrop-blur-md">
          <h1 className="text-3xl font-bold text-orange-400">{post.title}</h1>
          <div className="text-orange-300/70 mt-2 mb-6">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div
            className="prose prose-invert prose-orange max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}
