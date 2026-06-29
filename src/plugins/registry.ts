import type { PluginBundle } from "./types";
import { housePlugin } from "./house-build";
import { educateKidsPlugin } from "./educate-kids";
import { guitarPlugin } from "./guitar-progress";

export const BUILTIN_PLUGINS: PluginBundle[] = [
  housePlugin,
  educateKidsPlugin,
  guitarPlugin,
];

export function findPlugin(id: string): PluginBundle | undefined {
  return BUILTIN_PLUGINS.find((p) => p.id === id);
}
