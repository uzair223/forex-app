import React, { useEffect, useRef } from "react";
import sleep from "@/lib/utils/sleep";

interface ModalProps extends React.PropsWithChildren {
  open: boolean;
  onClose: () => void;
}
function Modal({ open, onClose, children }: ModalProps) {
  // const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !open) return;
    (async () => {
      await sleep(10);
      ref.current?.classList.remove("opacity-0");
    })();
  }, [ref, open]);

  return open ? (
    <div
      className="absolute top-0 left-0 w-screen h-screen bg-zinc-600/50 backdrop-blur-sm z-50 transition duration-500 opacity-0"
      ref={ref}
    >
      <div className="absolute w-1/2 h-3/4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <span
          className="absolute top-0 right-0 p-2 pt-1 cursor-pointer font-semibold text-sm text-zinc-500 transition hover:text-zinc-600 hover:-translate-y-1"
          onClick={async () => {
            ref.current?.classList.add("opacity-0");
            await sleep(400);
            onClose();
          }}
        >
          &#10005;
        </span>
        {children}
      </div>
    </div>
  ) : null;
}

export default Modal;
