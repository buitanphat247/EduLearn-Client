import { useState, useEffect } from "react";
import { Modal, Avatar, Input, Button } from "antd";
import { LikeOutlined, LikeFilled, CommentOutlined, SendOutlined } from "@ant-design/icons";
import type { Comment } from "@/interface/common";

interface CommentModalProps {
  open: boolean;
  postId: string | number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (postId: string | number, content: string, parentId?: string | number) => void;
  onLikeComment: (commentId: string | number) => void;
  onLikePost: (postId: string | number) => void;
}

export default function CommentModal({
  open,
  postId,
  author,
  avatar,
  time,
  content,
  likes: initialLikes,
  comments: initialComments,
  onClose,
  onAddComment,
  onLikeComment,
  onLikePost,
}: CommentModalProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [likedComments, setLikedComments] = useState<Set<string | number>>(new Set());
  const [commentLikes, setCommentLikes] = useState<Record<string | number, number>>({});
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [postLikes, setPostLikes] = useState(initialLikes);
  const [comments, setComments] = useState<Comment[]>(initialComments);

  // Sync state with props when modal opens
  useEffect(() => {
    if (open) {
      setPostLikes(initialLikes);
      setComments(initialComments);
      setIsPostLiked(false);
      setLikedComments(new Set());
      setCommentLikes({});
      setNewComment("");
      setReplyingTo(null);
      setReplyContent("");
    }
  }, [open, initialLikes, initialComments]);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: "Bạn",
        avatar: "B",
        time: "Vừa xong",
        content: newComment,
        likes: 0,
        replies: [],
      };

      if (replyingTo) {
        // Add reply
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === replyingTo) {
              return { ...c, replies: [...(c.replies || []), comment] };
            }
            return c;
          })
        );
        onAddComment(postId, replyContent, replyingTo);
        setReplyContent("");
      } else {
        // Add top-level comment
        setComments((prev) => [...prev, comment]);
        onAddComment(postId, newComment);
      }
      setNewComment("");
      setReplyingTo(null);
    }
  };

  const handleLikeComment = (commentId: string | number) => {
    const isLiked = likedComments.has(commentId);
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });

    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + (isLiked ? -1 : 1),
    }));

    onLikeComment(commentId);
  };

  const handleLikePost = () => {
    setIsPostLiked(!isPostLiked);
    setPostLikes((prev) => prev + (isPostLiked ? -1 : 1));
    onLikePost(postId);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      styles={{
        body: {
          padding: 0,
          height: "90vh",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div className="flex flex-col h-full">
        {/* Post Header */}
        <div className="flex flex-col h-full space-y-2">
          <div className=" bg-white shrink-0 space-y-2">
            <div className="flex items-center gap-3 mb-3">
              <Avatar size={40} className="bg-blue-500">
                {avatar}
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{author}</div>
                <div className="text-xs text-gray-500">{time}</div>
              </div>
            </div>
            <p className="text-gray-800 leading-relaxed">{content}</p>
            <div className="flex items-center gap-4 border-t border-b border-gray-300 py-1">
              <Button
                type="text"
                icon={isPostLiked ? <LikeFilled className="text-blue-500" /> : <LikeOutlined />}
                onClick={handleLikePost}
                className={isPostLiked ? "text-blue-500" : ""}
              >
                {postLikes} Thích
              </Button>
              <Button type="text" icon={<CommentOutlined className="text-blue-500" />}>
                {comments.length} Bình luận
              </Button>
            </div>
          </div>

          {/* Comments List - Scrollable */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CommentOutlined className="text-3xl mb-2" />
                <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
              </div>
            ) : (
              comments.map((comment) => {
                const isLiked = likedComments.has(comment.id);
                const likes = (comment.likes || 0) + (commentLikes[comment.id] || 0);

                return (
                  <div key={comment.id} className="space-y-2">
                    {/* Main Comment */}
                    <div className="flex gap-3">
                      <Avatar size={32} className="bg-blue-500 shrink-0">
                        {comment.avatar}
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
                          <div className="font-semibold text-sm text-gray-900 mb-1">{comment.author}</div>
                          <div className="text-gray-800 text-sm">{comment.content}</div>
                        </div>
                        <div className="flex items-center gap-4 mt-1 ml-1">
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className={`text-xs ${isLiked ? "text-blue-500 font-semibold" : "text-gray-500"}`}
                          >
                            Thích
                          </button>
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Phản hồi
                          </button>
                          <span className="text-xs text-gray-400">{comment.time}</span>
                          {likes > 0 && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <LikeFilled className="text-blue-500 text-xs" />
                              {likes}
                            </span>
                          )}
                        </div>

                        {/* Reply Input */}
                        {replyingTo === comment.id && (
                          <div className="mt-2 flex gap-2">
                            <Avatar size={24} className="bg-blue-500 shrink-0">
                              B
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                              <Input
                                placeholder="Viết phản hồi..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onPressEnter={handleSubmitComment}
                                className="rounded-full"
                                size="small"
                              />
                              <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSubmitComment}
                                size="small"
                                disabled={!replyContent.trim()}
                              />
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-2 ml-4 space-y-2">
                            {comment.replies.map((reply) => {
                              const isReplyLiked = likedComments.has(reply.id);
                              const replyLikes = (reply.likes || 0) + (commentLikes[reply.id] || 0);

                              return (
                                <div key={reply.id} className="flex gap-3">
                                  <Avatar size={28} className="bg-green-500 shrink-0">
                                    {reply.avatar}
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
                                      <div className="font-semibold text-sm text-gray-900 mb-1">{reply.author}</div>
                                      <div className="text-gray-800 text-sm">{reply.content}</div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 ml-1">
                                      <button
                                        onClick={() => handleLikeComment(reply.id)}
                                        className={`text-xs ${isReplyLiked ? "text-blue-500 font-semibold" : "text-gray-500"}`}
                                      >
                                        Thích
                                      </button>
                                      <span className="text-xs text-gray-400">{reply.time}</span>
                                      {replyLikes > 0 && (
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                          <LikeFilled className="text-blue-500 text-xs" />
                                          {replyLikes}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className=" bg-white shrink-0">
          <div className="flex gap-2 items-center">
            <Avatar size={32} className="bg-blue-500 shrink-0">
              B
            </Avatar>
            <Input
              placeholder="Viết bình luận..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onPressEnter={handleSubmitComment}
              className="rounded-full"
              size="large"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
