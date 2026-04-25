import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/routes/_authenticated/settings";

export const Route = createFileRoute("/android/_authenticated/settings")({
  head: () => ({
    meta: [{ title: "Settings — NexaPayslip Android" }],
  }),
  component: SettingsPage,
});
