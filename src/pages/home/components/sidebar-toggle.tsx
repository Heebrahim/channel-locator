import clsx from "clsx";

import { BiArrowFromLeft, BiArrowToLeft } from "react-icons/bi";
import styles from "../style.module.css";

// @ts-expect-error
import { useMediaQuery } from "@uidotdev/usehooks";

import { AnimatePresence, motion } from "framer-motion";

export function SidebarToggle({
  state,
  onToggle,
}: {
  state: "visible" | "hidden";
  onToggle: () => void;
}) {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  return (
    <motion.button
      onClick={onToggle}
      layout={isLargeScreen}
      className={clsx("p-1", styles.side_bar_toggle, {
        [styles.side_bar_toggle__collapsed]: state === "hidden",
      })}
    >
      <AnimatePresence initial={false}>
        {state === "visible" ? (
          <motion.div
            initial={{ rotate: 90, opacity: 0.7 }}
            animate={{ rotate: 0, opacity: 1 }}
          >
            <BiArrowToLeft size={20} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {state === "hidden" ? (
          <motion.div
            initial={{ rotate: -90, opacity: 0.7 }}
            animate={{ rotate: 0, opacity: 1 }}
          >
            <BiArrowFromLeft size={20} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}
