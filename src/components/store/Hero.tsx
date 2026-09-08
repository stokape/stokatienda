import { useDataStore } from "../../store/dataStore";
import { HeroContent } from "./HeroContent";

export function Hero() {
  const content = useDataStore((s) => s.siteContent);
  return <HeroContent content={content} />;
}
