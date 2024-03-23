import React, { useState } from "react";
import Modal from "../Modal";
import forms from "./forms";
import type { IndicatorComponent } from "./componentBuilder";

interface IndicatorModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  add: <T extends IndicatorComponent>(x: T) => void;
}
function IndicatorModal({ open, setOpen, add }: IndicatorModalProps) {
  const [selected, setSelected] = useState<number>();
  return open ? (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <div className="flex flex-row w-full h-full p-4 bg-white transition dark:bg-zinc-800 rounded-md">
        <div className="p-2 mr-2 flex-auto">
          <p className="font-semibold text-lg">Add Indicators</p>
          <ul className="divide divide-y transition dark:divide-zinc-600">
            {forms.map((Component, i) => (
              <li key={i} className="group p-1" onClick={() => setSelected(i)}>
                {Component.displayName}
                <span className="absolute text-zinc-400 opacity-0 -translate-x-4 transition group-hover:opacity-100 group-hover:translate-x-0">
                  &nbsp;&#128930;
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 mt-4 w-1/2 rounded-md border transition dark:border-none dark:bg-zinc-700/10">
          {(() => {
            if (typeof selected === "undefined") return;
            const Component = forms[selected];
            return <Component add={add} onAdd={() => setOpen(false)} />;
          })()}
        </div>
      </div>
    </Modal>
  ) : null;
}

export default IndicatorModal;
