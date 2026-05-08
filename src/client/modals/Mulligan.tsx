import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="pointer-events-auto fixed bottom-6 left-6 w-85 border-white/10 bg-slate-950/70 text-slate-50 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">Mulligan</CardTitle>
        <CardDescription className="text-slate-300">
          Choose whether to redraw or lock in your opening hand.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1 rounded-full"
          onClick={handleDrawAgain}
          disabled={waitingReady}
        >
          اسحب يد أخرى
        </Button>
        <Button
          className="flex-1 rounded-full"
          onClick={keepCards}
          disabled={waitingReady}
        >
          احتفظ باليد
        </Button>
      </CardContent>
    </Card>
  );
};
