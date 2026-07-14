import "client-only";

import { del, get, set } from "idb-keyval";
import type { ProjectState } from "@/lib/types";

const PROJECT_KEY = "vocabulary-studio:active-project:v1";

export async function loadProject() {
  return get<ProjectState>(PROJECT_KEY);
}

export async function saveProject(project: ProjectState) {
  await set(PROJECT_KEY, project);
}

export async function clearSavedProject() {
  await del(PROJECT_KEY);
}
