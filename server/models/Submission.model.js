import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
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
    executionTime: { type: Number, default: 0, min: 0 },
    memoryUsed: { type: Number, default: 0, min: 0 },
    results: [{
      testCase: { type: Number, required: true },
      passed: { type: Boolean, required: true },
      input: { type: String, default: '' },
      expectedOutput: { type: String, default: '' },
      actualOutput: { type: String, default: '' },
      error: { type: mongoose.Schema.Types.Mixed, default: null },
    }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Index for faster user submissions lookup
submissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });

// Virtual to check if all test cases passed
submissionSchema.virtual('passedAllTests').get(function () {
  return this.results.every(r => r.passed);
});

export default mongoose.model('Submission', submissionSchema);
