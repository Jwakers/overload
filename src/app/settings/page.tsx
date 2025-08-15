import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "App settings and preferences.",
};

export default function SettingsPage() {
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-slate-600">
          App settings and preferences will appear here. This is a placeholder
          page.
        </p>
      </div>
    </div>
  );
}
