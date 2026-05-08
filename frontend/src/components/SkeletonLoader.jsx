// SkeletonLoader.jsx
export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse flex flex-col gap-2 min-h-[110px]">
    <div className="w-10 h-10 bg-gray-200 rounded-full mb-2" />
    <div className="h-5 bg-gray-200 rounded w-1/2" />
    <div className="h-3 bg-gray-200 rounded w-1/3" />
  </div>
);

export const TaskCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse flex flex-col gap-2 min-h-[70px]">
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-1" />
    <div className="h-3 bg-gray-200 rounded w-1/3" />
    <div className="flex gap-2 mt-2">
      <div className="w-6 h-6 bg-gray-200 rounded-full" />
      <div className="w-16 h-3 bg-gray-200 rounded" />
    </div>
  </div>
);

export const ProjectCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse flex flex-col gap-3 min-h-[140px]">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-2/3" />
    <div className="flex gap-2 mt-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full" />
      <div className="w-20 h-3 bg-gray-200 rounded" />
    </div>
  </div>
);

export default { StatCardSkeleton, TaskCardSkeleton, ProjectCardSkeleton };
