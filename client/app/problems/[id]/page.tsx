import { Suspense } from 'react';
import Loader from '@/components/Loader';
import ProblemWorkspaceClient from './problem-workspace-client';

export default function ProblemDetailPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ProblemWorkspaceClient />
    </Suspense>
  );
}
