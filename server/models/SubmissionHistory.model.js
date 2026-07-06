import mongoose from 'mongoose';

const submissionHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    code: { type: String, required: true },
    language: { type: String, enum: ['javascript', 'python', 'cpp', 'c', 'java'], default: 'javascript' },
    status: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Internal Error', 'Execution Error'],
      required: true,
    },
    passed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for faster lookups
submissionHistorySchema.index({ userId: 1, problemId: 1, createdAt: -1 });
submissionHistorySchema.index({ problemId: 1, createdAt: -1 });

export default mongoose.model('SubmissionHistory', submissionHistorySchema);
