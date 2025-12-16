import { appConfig } from "@/config/app"
import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

export const Logo = (props?: { size?: "lg" | "sm", showDesc?: boolean }) => {
    const { size = "lg", showDesc = true } = props || {}

    if (size === "sm") {
        return (
            <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-3">
                    <div className={`flex rounded-full bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/50 text-sm md:text-lg p-1 px-2`}>
                        21
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className={cn(`text-xl md:text-xl font-bold tracking-tight`,)}>{appConfig.name}</span>
                        {showDesc && <span className={"hidden text-xs font-semibold text-muted-foreground md:block"}>{appConfig.description}</span>}
                    </div>
                </Link >
            </div >
        )
    }

    return (
        <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
                <div className={`flex rounded-full bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/50 text-2xl md:text-3xl p-2`}>
                    21
                </div>
                <div className="flex flex-col leading-tight">
                    <span className={`text-xl md:text-2xl font-bold tracking-tight`}>{appConfig.name}</span>
                    {showDesc && <span className={"hidden text-sm font-semibold text-muted-foreground md:block"}>{appConfig.description}</span>}
                </div>
            </Link>
        </div>
    )
}