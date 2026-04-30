import { Metadata } from "next";
import CreateStoryForm from "@/components/create/CreateStoryForm";

export const metadata: Metadata = {
  title: "Create Story – DreamTales",
};

export default function CreatePage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-white">✨ New Story</h1>
        <p className="text-white/40 text-sm">Let's turn today into tonight's adventure</p>
      </div>
      <CreateStoryForm />
    </div>
  );
}
