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
    return null;
  }
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const htmlContent = marked(post.content);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full text-left border border-orange-500/20 p-6 rounded-lg shadow-lg shadow-black/50 backdrop-blur-md">
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
  );
}
