import { MainLayout } from "@/views/layout/MainLayout"
import BlueprintCanvas from "@/components/BlueprintCanvas"
import { Toolbar } from "@/components/Toolbar"

export default function BlueprintDemo() {
  return (
    <MainLayout
      toolbar={<Toolbar />}
      canvas={<BlueprintCanvas />}
    />
  )
}