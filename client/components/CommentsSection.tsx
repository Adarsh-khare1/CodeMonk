import { useState } from 'react';
import { Send, MessageSquare, ThumbsUp, MoreHorizontal, Reply } from 'lucide-react';
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

  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: Comment;
    depth?: number;
  }) => {
    const maxDepth = 5;
    const canReply = depth < maxDepth;

    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [liked, setLiked] = useState(false);

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
          depth > 0 ? 'ml-8 mt-4' : 'mt-6'
        } relative`}
      >
        {depth > 0 && (
          <div className="absolute -left-6 top-6 bottom-0 w-px bg-border/50" />
        )}
        
        <div className="flex gap-4">
          <Avatar username={comment.userId?.username || 'User'} size={depth === 0 ? "md" : "sm"} />
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {comment.userId?.username || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <button className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-secondary transition">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[15px] text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
              
              <div className="mt-3 flex items-center gap-4">
                <button 
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition ${liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-primary' : ''}`} />
                  <span>{liked ? '1' : '0'}</span>
                </button>
                
                {canReply && (
                  <button
                    onClick={() => {
                      if (!user) onLoginRequired('comment');
                      else setShowReplyBox(!showReplyBox);
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                )}
              </div>
            </div>

            {showReplyBox && (
              <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.userId?.username || 'User'}...`}
                  className="w-full bg-transparent text-sm outline-none resize-y min-h-[60px]"
                  autoFocus
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowReplyBox(false);
                      setReplyText('');
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReplySubmit}
                    disabled={!replyText.trim() || submittingReply}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingReply ? 'Sending...' : 'Reply'}
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-6">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight">
        <MessageSquare className="h-5 w-5 text-primary" />
        Discussion ({comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)})
      </h2>

      {user ? (
        <div className="mb-10 flex gap-4">
          <Avatar username={user.username} size="md" />
          <div className="flex-1 rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts?"
              className="w-full bg-transparent outline-none resize-y min-h-[80px]"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleCommentSubmit}
                disabled={submittingComment || !newComment.trim()}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-10 rounded-2xl border border-border/70 bg-secondary/30 p-8 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="mb-4 text-foreground font-medium">Join the discussion</p>
          <button
            onClick={() => onLoginRequired('comment')}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110 shadow-sm"
          >
            Login to Comment
          </button>
        </div>
      )}

      <div className="space-y-2">
        {comments.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground italic">
            No comments yet. Be the first to share your approach!
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
