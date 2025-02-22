import fs from "fs";
import path from "path";
import matter from "gray-matter";
import BlogList from "./BlogList";

async function getBlogPosts() {
  const blogDir = path.join(process.cwd(), "public/blog");

  // Check if directory exists
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const folders = fs.readdirSync(blogDir);

  const posts = folders.map((folder) => {
    const markdownFile = fs.readFileSync(
      path.join(blogDir, folder, "index.md"),
      "utf-8",
    );

    const { data: frontmatter, content } = matter(markdownFile);

    return {
      slug: folder,
      title: frontmatter.title,
      date: frontmatter.date,
      content: content,
    };
  });

  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogList posts={posts} />;
}
