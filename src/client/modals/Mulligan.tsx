import Style from "@/css/mulligan.module.css";
import { socketEmit } from "@/features/socket/SocketFactory";
import { useState } from "react";

export const Mulligan = () => {
  const [waitingReady, setWaitingReady] = useState(false);
  function handleDrawAgain() {
    socketEmit({
      name: "mulligan:action",
    });
  }

  function keepCards() {
    socketEmit({
      name: "set-ready:action",
    });
    setWaitingReady(true);
  }

  return (
    <div className={Style.mulliganContainer}>
      <button
        className={Style.draw}
        onClick={handleDrawAgain}
        disabled={waitingReady}
      >
        اسحب يد أخرى
      </button>
      <button
        className={Style.keep}
        onClick={keepCards}
        disabled={waitingReady}
      >
        احتفظ باليد{" "}
      </button>
    </div>
  );
};
