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
      className="fixed top-0 left-0 w-screen h-screen bg-zinc-600/50 backdrop-blur-sm z-50 transition duration-500 opacity-0 grid place-items-center"
      ref={ref}
    >
      <div className="relative h-fit w-full sm:w-4/5 md:w-2/3 min-h-[80%] overflow-y-auto">
        <span
          className="absolute top-0 right-0 p-2 pt-1 cursor-pointer font-semibold text-lg text-zinc-500 transition hover:text-zinc-600 hover:-translate-y-1"
          onClick={async () => {
            ref.current?.classList.add("opacity-0");
            await sleep(400);
            onClose();
          }}
        >
          &#215;
        </span>
        {children}
      </div>
    </div>
  ) : null;
}

export default Modal;
