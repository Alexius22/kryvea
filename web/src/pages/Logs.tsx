import { mdiListBox } from "@mdi/js";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getData } from "../api/api";
import Card from "../components/Composition/Card";
import Flex from "../components/Composition/Flex";
import Grid from "../components/Composition/Grid";
import PageHeader from "../components/Composition/PageHeader";
import Table from "../components/Composition/Table";
import Checkbox from "../components/Form/Checkbox";
import { getPageTitle } from "../utils/helpers";

type Log = {
  level: string;
  source: string;
  time: string;
  message: string;
  [key: string]: any;
};

const ALL_LEVELS = ["info", "debug", "error"];

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["error"]);

  function fetchLogs() {
    if (selectedLevels.length === 0) {
      setLogs([]);
      return;
    }
    const toastId = toast.loading("Loading logs...");

    getData<{ logs: Log[] }>(
      `/api/admin/logs?levels=${selectedLevels.join(",")}`,
      data => {
        setLogs(data.logs);
        toast.update(toastId, {
          render: "Logs loaded successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      },
      () => {
        toast.update(toastId, {
          render: "Failed to load logs",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    );
  }

  useEffect(() => {
    document.title = getPageTitle("Logs");
    fetchLogs();
  }, [selectedLevels]);

  function toggleLevel(level: string) {
    setSelectedLevels(prev => (prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]));
  }

  return (
    <div>
      <PageHeader icon={mdiListBox} title="Logs" />
      <Grid>
        <Card>
          <Flex className="gap-2">
            <h1 className="font-bold">Include log level:</h1>
            {ALL_LEVELS.map(level => (
              <Checkbox
                id={`logs-levels-${level}`}
                key={level}
                label={level}
                checked={selectedLevels.includes(level)}
                onChange={() => toggleLevel(level)}
              />
            ))}
          </Flex>
        </Card>

        <Table
          data={logs?.map(log => ({
            Timestamp: new Date(log.time).toLocaleString(),
            Level: log.level,
            IP: log.ip,
            Method: log.method,
            URL: log.url,
            Status: log.status,
            Message: log.message,
            Source: log.source,
          }))}
          perPageCustom={50}
          maxWidthColumns={{ Message: "30rem" }}
        />
      </Grid>
    </div>
  );
}
