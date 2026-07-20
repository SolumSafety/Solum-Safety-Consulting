"use client"

import { useState } from "react"

type BlogPost = {
  id: string
  slug: string
  title: string
  meta_description: string | null
  content_html: string
  status: "draft" | "published"
  created_at: string
}

export function BlogAdminPanel({ initialPosts, bypassKey }: { initialPosts: BlogPost[]; bypassKey: string }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [topic, setTopic] = useState("")
  const [keyword, setKeyword] = useState("")
  const [generating, setGenerating] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function generate() {
    if (!topic.trim()) return
    setGenerating(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-solly-bypass": bypassKey },
        body: JSON.stringify({ topic, targetKeyword: keyword || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not generate article.")
      setPosts((p) => [data.post, ...p])
      setTopic("")
      setKeyword("")
      setExpandedId(data.post.id)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setGenerating(false)
    }
  }

  async function updateStatus(postId: string, action: "publish" | "unpublish" | "delete") {
    setErrorMsg(null)
    try {
      const res = await fetch("/api/blog/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-solly-bypass": bypassKey },
        body: JSON.stringify({ postId, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not update.")

      if (action === "delete") {
        setPosts((p) => p.filter((post) => post.id !== postId))
      } else {
        setPosts((p) =>
          p.map((post) => (post.id === postId ? { ...post, status: action === "publish" ? "published" : "draft" } : post)),
        )
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  return (
    <div className="mt-6">
      <div className="rounded-xl border border-[#E4DFD3] bg-white p-4">
        <p className="text-sm font-semibold text-[#16294D]">Generate a new article</p>
        <div className="mt-3 flex flex-col gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic — e.g. How to write a SWMS for high-risk construction work"
            className="rounded-lg border border-[#E4DFD3] px-3 py-2 text-sm outline-none focus:border-[#18707F]"
          />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Target keyword (optional) — e.g. SWMS template NSW"
            className="rounded-lg border border-[#E4DFD3] px-3 py-2 text-sm outline-none focus:border-[#18707F]"
          />
          <button
            onClick={generate}
            disabled={generating || !topic.trim()}
            className="rounded-lg bg-[#16294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#18707F] disabled:opacity-40"
          >
            {generating ? "Generating…" : "Generate draft"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
      )}

      <div className="mt-6 space-y-3">
        {posts.length === 0 && (
          <p className="rounded-xl border border-[#E4DFD3] bg-white p-6 text-center text-sm text-[#5A6472]">
            No articles yet.
          </p>
        )}
        {posts.map((post) => {
          const isExpanded = expandedId === post.id
          return (
            <div key={post.id} className="rounded-xl border border-[#E4DFD3] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#16294D]">{post.title}</p>
                  <p className="text-xs text-[#9CA3AF]">/{post.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                      post.status === "published"
                        ? "bg-[#C9A84C]/20 text-[#8A6D2B]"
                        : "bg-[#8FB4BC]/20 text-[#16294D]"
                    }`}
                  >
                    {post.status}
                  </span>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : post.id)}
                    className="rounded-full border border-[#E4DFD3] px-3 py-1.5 text-xs font-semibold text-[#5A6472] hover:border-[#18707F]"
                  >
                    {isExpanded ? "Hide" : "Preview"}
                  </button>
                  {post.status === "draft" ? (
                    <button
                      onClick={() => updateStatus(post.id, "publish")}
                      className="rounded-full bg-[#16294D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#18707F]"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(post.id, "unpublish")}
                      className="rounded-full border border-[#E4DFD3] px-3 py-1.5 text-xs font-semibold text-[#5A6472] hover:border-[#18707F]"
                    >
                      Unpublish
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(post.id, "delete")}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-[#E4DFD3] bg-[#FAFAF7] p-4">
                  <p className="mb-2 text-xs text-[#9CA3AF]">{post.meta_description}</p>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: post.content_html }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
