"use client";

import { Tag, message } from "antd";
import { FireOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import PostCard from "@/app/components/community_components/PostCard";
import CreatePostModal from "@/app/components/community_components/CreatePostModal";
import CommentModal from "@/app/components/modal_components/CommentModal";
import ShareModal from "@/app/components/modal_components/ShareModal";
import CommunitySearchModal from "@/app/components/modal_components/CommunitySearchModal";
import CommunityHeader from "@/app/components/community_components/CommunityHeader";
import CustomCard from "@/app/components/ui_components/CustomCard";
import type { Comment } from "@/app/types/types";

const posts = [
  {
    id: 1,
    author: "Nguyễn Văn A",
    avatar: "A",
    time: "2 giờ trước",
    content:
      "Có ai biết cách giải bài toán này không? Mình đang gặp khó khăn với bài tập về hàm số. Cụ thể là bài tập số 5 trong sách giáo khoa trang 45. Ai có thể giải thích giúp mình không?",
    likes: 15,
    comments: 8,
    tags: ["Toán học", "Hỏi đáp"],
    commentsList: [
      {
        id: "1",
        author: "Trần Thị B",
        avatar: "B",
        time: "1 giờ trước",
        content: "Mình có thể giúp bạn! Bài này sử dụng công thức đạo hàm. Bạn thử áp dụng quy tắc chuỗi xem.",
        likes: 5,
        replies: [
          {
            id: "1-1",
            author: "Nguyễn Văn A",
            avatar: "A",
            time: "30 phút trước",
            content: "Cảm ơn bạn nhiều! Mình sẽ thử ngay.",
            likes: 2,
          },
        ],
      },
      {
        id: "2",
        author: "Lê Văn C",
        avatar: "C",
        time: "45 phút trước",
        content: "Bạn có thể xem video hướng dẫn ở link này: youtube.com/...",
        likes: 3,
      },
    ] as Comment[],
  },
  {
    id: 2,
    author: "Trần Thị B",
    avatar: "B",
    time: "5 giờ trước",
    content: "Chia sẻ tài liệu ôn thi học kỳ môn Văn. Hy vọng giúp ích cho các bạn! File đính kèm bao gồm các đề thi thử và đáp án chi tiết.",
    likes: 32,
    comments: 12,
    tags: ["Ngữ văn", "Tài liệu"],
    commentsList: [
      {
        id: "3",
        author: "Phạm Thị D",
        avatar: "D",
        time: "3 giờ trước",
        content: "Cảm ơn bạn rất nhiều! Tài liệu rất hữu ích.",
        likes: 8,
      },
    ] as Comment[],
  },
  {
    id: 3,
    author: "Lê Văn C",
    avatar: "C",
    time: "1 ngày trước",
    content: "Thảo luận về phương pháp học tập hiệu quả. Các bạn có phương pháp nào hay không? Mình đang tìm cách cải thiện điểm số.",
    likes: 28,
    comments: 20,
    tags: ["Học tập", "Thảo luận"],
    commentsList: [] as Comment[],
  },
  {
    id: 4,
    author: "Phạm Thị D",
    avatar: "D",
    time: "2 ngày trước",
    content: "Mình vừa tìm được một số video bài giảng rất hay về Vật lý. Ai cần thì comment nhé!",
    likes: 45,
    comments: 15,
    tags: ["Vật lý", "Video"],
    commentsList: [] as Comment[],
  },
];

const MathIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const LiteratureIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const PhysicsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ChemistryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    />
  </svg>
);

const BiologyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GeographyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const EnglishIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
    />
  </svg>
);

const topics = [
  { id: 1, name: "Toán học", count: 125, icon: MathIcon },
  { id: 2, name: "Ngữ văn", count: 89, icon: LiteratureIcon },
  { id: 3, name: "Vật lý", count: 67, icon: PhysicsIcon },
  { id: 4, name: "Hóa học", count: 54, icon: ChemistryIcon },
  { id: 5, name: "Sinh học", count: 43, icon: BiologyIcon },
  { id: 6, name: "Lịch sử", count: 38, icon: HistoryIcon },
  { id: 7, name: "Địa lý", count: 32, icon: GeographyIcon },
  { id: 8, name: "Tiếng Anh", count: 76, icon: EnglishIcon },
];

export default function UserCommunity() {
  const [searchText, setSearchText] = useState("");
  const [postContent, setPostContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<(typeof posts)[0] | null>(null);
  const [selectedPostForShare, setSelectedPostForShare] = useState<(typeof posts)[0] | null>(null);

  // Keyboard shortcut: Ctrl/Cmd + K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === "Escape" && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen]);

  const filteredPosts = posts.filter(
    (post) =>
      post.content.toLowerCase().includes(searchText.toLowerCase()) ||
      post.author.toLowerCase().includes(searchText.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handlePost = () => {
    if (postContent.trim()) {
      setPostContent("");
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setPostContent("");
  };

  const handleCommentClick = (post: (typeof posts)[0]) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
  };

  const handleShareClick = (post: (typeof posts)[0]) => {
    setSelectedPostForShare(post);
    setIsShareModalOpen(true);
  };

  const handleAddComment = (_postId: string | number, _content: string, parentId?: string | number) => {
    message.success(parentId ? "Đã phản hồi!" : "Đã bình luận!");
  };

  const handleLikeComment = (_commentId: string | number) => {
    // In real app, this would update the comment's likes
  };

  const handleLikePost = (_postId: string | number) => {
    // In real app, this would update the post's likes
  };

  const handleSearchPostClick = (post: (typeof posts)[0]) => {
    setSearchText("");
    // Scroll to post or highlight it
    const element = document.getElementById(`post-${post.id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-blue-500");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-blue-500");
      }, 2000);
    }
  };

  return (
    <div className="space-y-3">
      <CommunityHeader
        onSearchClick={() => setIsSearchModalOpen(true)}
        onCreatePostClick={() => setIsModalOpen(true)}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-3">
          {/* Posts List */}
          <div className="space-y-3">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} id={`post-${post.id}`}>
                  <PostCard
                    id={post.id}
                    author={post.author}
                    avatar={post.avatar}
                    time={post.time}
                    content={post.content}
                    tags={post.tags}
                    likes={post.likes}
                    comments={post.comments}
                    onCommentClick={() => handleCommentClick(post)}
                    onShareClick={() => handleShareClick(post)}
                  />
                </div>
              ))
            ) : (
              <CustomCard padding="lg">
                <div className="text-center py-8 text-gray-500">Không tìm thấy bài viết nào</div>
              </CustomCard>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <CustomCard padding="none">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Chủ đề phổ biến</h3>
              <FireOutlined className="text-orange-500" />
            </div>
            <div className="p-6">
              <div className="space-y-0">
                {topics.map((topic, index) => {
                  const IconComponent = topic.icon;
                  return (
                    <div
                      key={index}
                      className="cursor-pointer hover:bg-blue-50/50 rounded-lg px-3 py-3 transition-colors mb-2 border-gray-100 last:border-b-0 last:mb-0"
                      onClick={() => setSearchText(topic.name)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <span className="text-blue-500">
                            <IconComponent />
                          </span>
                          <span className="font-medium text-gray-800">{topic.name}</span>
                        </div>
                        <Tag color="blue" className="px-2 py-0.5 rounded-md text-xs">{topic.count}</Tag>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CustomCard>
        </div>
      </div>

      <CreatePostModal
        open={isModalOpen}
        postContent={postContent}
        onContentChange={setPostContent}
        onPost={handlePost}
        onCancel={handleCancel}
      />

      <CommunitySearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        posts={posts}
        onPostClick={handleSearchPostClick}
      />

      {selectedPostForShare && (
        <ShareModal
          open={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setSelectedPostForShare(null);
          }}
          postId={selectedPostForShare.id}
          author={selectedPostForShare.author}
          content={selectedPostForShare.content}
        />
      )}

      {selectedPost && (
        <CommentModal
          open={isCommentModalOpen}
          postId={selectedPost.id}
          author={selectedPost.author}
          avatar={selectedPost.avatar}
          time={selectedPost.time}
          content={selectedPost.content}
          likes={selectedPost.likes}
          comments={selectedPost.commentsList || []}
          onClose={() => setIsCommentModalOpen(false)}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onLikePost={handleLikePost}
        />
      )}
    </div>
  );
}

