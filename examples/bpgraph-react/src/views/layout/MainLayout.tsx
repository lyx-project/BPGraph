
import { EngineProvider } from "@/context/engine-context"
type MainLayoutProps = {
  toolbar: React.ReactNode
  canvas: React.ReactNode
}

export function MainLayout({ toolbar, canvas }: MainLayoutProps) {
  return (
    <div className="h-screen relative select-none">
      <div className="w-screen h-screen absolute top-0 left-0">
        <EngineProvider>
          {canvas}
        </EngineProvider>
      </div>

      <div className="absolute top-0 right-0 w-max">
        {toolbar}
      </div>
    </div>
  )
}