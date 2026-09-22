"use client";

import type { ReactNode } from "react";
import {
  getLevelById,
} from "@/engine";
import { useExperienceSession } from "@/stores/experience-session";
import { Button } from "@/components/shared/Button";
import { StoryLevel } from "./levels/StoryLevel";
import { MemoryLevel } from "./levels/MemoryLevel";
import { QuizLevel } from "./levels/QuizLevel";
import { SortingLevel } from "./levels/SortingLevel";
import { CompatibilityLevel } from "./levels/CompatibilityLevel";
import { ChoiceLevel } from "./levels/ChoiceLevel";
import { InteractiveLevel } from "./levels/InteractiveLevel";
import { FinalLevel } from "./levels/FinalLevel";
import {
  ConnectionLevel,
  isConnectionLevel,
} from "./levels/ConnectionLevel";

function wrap(node: ReactNode) {
  return <div className="flex min-h-0 flex-1 flex-col">{node}</div>;
}

export function LevelPlayer() {
  const experience = useExperienceSession((s) => s.experience)!;
  const currentLevelId = useExperienceSession((s) => s.currentLevelId);
  const sceneIndex = useExperienceSession((s) => s.sceneIndex);
  const nextScene = useExperienceSession((s) => s.nextScene);
  const prevScene = useExperienceSession((s) => s.prevScene);
  const openMap = useExperienceSession((s) => s.openMap);
  const completeCurrentLevel = useExperienceSession((s) => s.completeCurrentLevel);
  const acceptProposal = useExperienceSession((s) => s.acceptProposal);

  const level = currentLevelId
    ? getLevelById(experience, currentLevelId)
    : undefined;

  if (!level) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Button variant="ghost" onClick={openMap}>
          Volver al mapa
        </Button>
      </div>
    );
  }

  const shared = {
    experience,
    level,
    onComplete: completeCurrentLevel,
    onExit: openMap,
  };

  switch (level.type) {
    case "memory":
    case "gallery":
      return wrap(<MemoryLevel {...shared} />);
    case "quiz":
      return wrap(<QuizLevel {...shared} />);
    case "sorting":
    case "timeline":
      return wrap(<SortingLevel {...shared} />);
    case "compatibility":
      return wrap(<CompatibilityLevel {...shared} />);
    case "choice":
      return wrap(<ChoiceLevel {...shared} />);
    case "interactive":
      return wrap(<InteractiveLevel {...shared} />);
    case "final":
      return wrap(
        <FinalLevel
          experience={experience}
          level={level}
          onAccept={acceptProposal}
          onExit={openMap}
        />,
      );
    case "story":
    default:
      if (isConnectionLevel(level)) {
        return wrap(<ConnectionLevel {...shared} />);
      }
      return wrap(
        <StoryLevel
          {...shared}
          sceneIndex={sceneIndex}
          onNext={nextScene}
          onPrev={prevScene}
        />,
      );
  }
}
