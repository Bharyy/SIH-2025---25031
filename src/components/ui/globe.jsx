
"use client";
import React from "react";
import dynamic from "next/dynamic";

const World = dynamic(() => import("./world").then((m) => ({ default: m.World })), {
  ssr: false,
});

export default function Globe() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="fixed inset-0 bg-background" />;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-[95vw] h-[95vw] max-w-[800px] max-h-[800px] min-w-[320px] min-h-[320px] relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <World />
        </div>
      </div>
    </div>
  );
}
