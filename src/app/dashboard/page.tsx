import { Metadata } from "next"
import { AudienceLists } from "./components/audience-lists"

export const metadata: Metadata = {
  title: "Audience Lists",
  description: "Manage your advertising audience lists",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <AudienceLists />
    </div>
  )
} 