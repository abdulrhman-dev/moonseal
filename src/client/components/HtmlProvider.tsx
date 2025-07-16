import { store } from "@/features/store";
import { Html } from "@react-three/drei";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";

export const HtmlProvider = ({ children }: PropsWithChildren) => {
  return (
    <Html>
      <Provider store={store}>{children}</Provider>
    </Html>
  );
};
