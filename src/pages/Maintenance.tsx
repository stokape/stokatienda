import { useDataStore } from "../store/dataStore";
import { MaintenanceContent } from "../components/store/MaintenanceContent";

export function Maintenance() {
  const maintenance = useDataStore((s) => s.maintenance);
  return <MaintenanceContent message={maintenance.message} endAt={maintenance.scheduled ? maintenance.endAt : undefined} />;
}
