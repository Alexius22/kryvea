import { mdiListBox } from "@mdi/js";
import { useEffect, useState } from "react";
import { getData } from "../api/api";
import Table from "../components/Composition/Table";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import { getPageTitle } from "../config";

export default function Logs() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    document.title = getPageTitle("Logs");
    getData("/api/logs/search?query=", setLogs);
  }, []);

  return (
    <div>
      <SectionTitleLineWithButton icon={mdiListBox} title="Logs Search" />
      <Table
        data={logs?.map(log => ({
          Timestamp: log,
          Source: log,
          Severity: log,
          Message: log,
        }))}
        perPageCustom={50}
      />
    </div>
  );
}
