import { AuthTest } from "@/components/auth-test"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Overview",
}

export default function HomePage() {
  return (
    <div className="container mx-auto py-10">
      <AuthTest />
    </div>
  )
}
