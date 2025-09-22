
"use client";
import React from "react";
import dynamic from "next/dynamic";

const World = dynamic(() => import("./world").then((m) => ({ default: m.World })), {
  ssr: false,
});

export default function Globe() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-full relative">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <World />
        </div>
      </div>
    </div>
  );
}
