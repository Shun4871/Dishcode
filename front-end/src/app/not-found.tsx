export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-4xl font-bold mb-4">ページが見つかりません</h1>
        <p className="text-lg">お探しのページは存在しないか、移動された可能性があります。</p>
      </div>
    );
  }