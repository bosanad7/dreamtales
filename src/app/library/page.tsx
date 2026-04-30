import { Metadata } from "next";
import StoryLibrary from "@/components/library/StoryLibrary";

export const metadata: Metadata = {
  title: "Library – DreamTales",
};

export default function LibraryPage() {
  return <StoryLibrary />;
}
