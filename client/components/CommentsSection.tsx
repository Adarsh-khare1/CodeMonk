import { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { formatTimeAgo } from '@/lib/utils';
import api from '@/lib/api';

interface Comment {
  _id: string;
  userId: { username: string; email: string };
  content: string;
  replies?: Comment[];
  createdAt: string;
}

interface CommentsSectionProps {
  problemId: string;
  comments: Comment[];
  onCommentsUpdate: (comments: Comment[]) => void;
  user: any;
  onLoginRequired: (action: 'comment') => void;
}

export default function CommentsSection({
  problemId,
  comments,
  onCommentsUpdate,
  user,
  onLoginRequired,
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await api.get('/comments', { params: { problemId } });
      onCommentsUpdate(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      onLoginRequired('comment');
      return;
    }

    setSubmittingComment(true);
    try {
      await api.post('/comments', { problemId, content: newComment });
      setNewComment('');
      await fetchComments();
    } catch (error: any) {
      if (error.response?.status === 401) onLoginRequired('comment');
      else alert(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Recursive CommentItem
  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: Comment;
    depth?: number;
  }) => {
    const maxDepth = 5;
    const canReply = depth < maxDepth;

    // ✅ Move reply state into the CommentItem
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const handleReplySubmit = async () => {
      if (!replyText.trim()) return;
      if (!user) {
        onLoginRequired('comment');
        return;
      }

      setSubmittingReply(true);
      try {
        await api.post('/comments', {
          problemId,
          content: replyText,
          parentId: comment._id,
        });
        setReplyText('');
        setShowReplyBox(false);
        await fetchComments();
      } catch (error: any) {
        if (error.response?.status === 401) onLoginRequired('comment');
        else alert(error.response?.data?.message || 'Failed to post reply');
      } finally {
        setSubmittingReply(false);
      }
    };

    return (
      <div
        className={`${
          depth > 0 ? 'ml-8 mt-3' : ''
        } border-l-2 border-border pl-4 py-3 transition hover:border-primary/60`}
      >
        <div className="flex items-start gap-3">
          <Avatar username={comment.userId?.username || 'User'} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">
                {comment.userId?.username || 'Anonymous'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="mb-2 text-sm text-foreground/90">{comment.content}</p>

            {canReply && user && (
              <button
                onClick={() => setShowReplyBox((prev) => !prev)}
                className="text-xs font-medium text-primary transition hover:text-primary/80"
              >
                Reply
              </button>
            )}
          </div>
        </div>

        {showReplyBox && (
          <div className="mt-3 ml-11">
            <div className="flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="input-surface min-h-[60px] flex-1 px-3 py-2 text-sm"
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim() || submittingReply}
                  className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyText('');
                  }}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Render replies recursively */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="surface-primary p-6">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight">
        <MessageSquare className="h-5 w-5" />
        Discussion
      </h2>

      {user ? (
        <div className="space-y-4 mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="input-surface min-h-[100px] w-full px-4 py-2"
          />
          <button
            onClick={handleCommentSubmit}
            disabled={submittingComment || !newComment.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Post Comment
          </button>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-border/70 bg-secondary/60 p-4">
          <p className="mb-3 text-foreground/90">Login to join the discussion</p>
          <button
            onClick={() => onLoginRequired('comment')}
            className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:brightness-110"
          >
            Login to Comment
          </button>
        </div>
      )}

      <div className="space-y-4 mt-6">
        {comments.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
