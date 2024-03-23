import React, { useState } from "react";
import Session from "./Session";
import { CollapseIcon, ExpandIcon } from "../icons";

function SessionGroup() {
  const [collapse, setCollapse] = useState(false);
  return (
    <div className="relative group">
      <div
        className={`flex gap-2 p-2 bg-white transition dark:bg-zinc-800 rounded-md flex-wrap justify-center ${
          collapse ? "lg:flex-nowrap" : "lg:justify-start"
        }`}
      >
        <Session
          name="Sydney" 
          flag="au" 
          tz="Australia/Sydney" 
          collapse={collapse} />
        <Session
          name="Tokyo" 
          flag="jp" 
          tz="Asia/Tokyo" 
          collapse={collapse} />
        <Session
          name="London" 
          flag="gb" 
          tz="Europe/London"
          collapse={collapse} />
        <Session
          name="New York"
          flag="us"
          tz="America/New_York"
          collapse={collapse}
        />
      </div>
      <div
        className={`absolute hidden lg:block bottom-0 right-0 h-6 w-6 m-2 cursor-pointer fill-zinc-500 rounded-md opacity-0 transition group-hover:opacity-100 hover:fill-zinc-600 hover:-translate-y-1 ${
          collapse ? "bg-white/50" : ""
        }`}
      >
        {collapse ? (
          <ExpandIcon onClick={() => setCollapse(false)} />
        ) : (
          <CollapseIcon onClick={() => setCollapse(true)} />
        )}
      </div>
    </div>
  );
}

export default SessionGroup;
