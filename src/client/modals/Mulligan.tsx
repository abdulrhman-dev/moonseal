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
    <Card className="pointer-events-auto fixed bottom-6 left-6 w-85 border-indigo-200/25 bg-indigo-950/66 text-indigo-50 shadow-[0_18px_36px_rgba(8,8,26,0.45)] backdrop-blur-xl" dir="rtl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">إعادة السحب</CardTitle>
        <CardDescription className="text-indigo-200/85">
          اختر بين سحب يد جديدة أو تثبيت اليد الافتتاحية.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1 rounded-full"
          onClick={handleDrawAgain}
          disabled={waitingReady}
        >
          اسحب مرة أخرى
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
