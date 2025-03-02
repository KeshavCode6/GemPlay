import { StoryCard } from "@/components/StoryCard"
import { Button } from "@/components/ui/button"
import { Cog, Gem, HelpCircle, Plus, UserIcon } from "lucide-react"
import { Link } from "react-router"

export default function MainMenu() {
    const recentStories = [
        {
            title: "The Lost Kingdom",
            created: "2 days ago",
            coverImage: "/placeholder.svg?height=80&width=120",
        },
        {
            title: "Starlight Journey",
            created: "1 week ago",
            coverImage: "/placeholder.svg?height=80&width=120",
        },
    ]

    return (
        <div className="h-screen relative bg-amber-50 flex flex-col items-center p-4 md:p-8">
            <img src="/menu.png" className="absolute inset-0 max-h-screen z-10 opacity-5 pointer-events-none" />
            <header className="w-full max-w-4xl flex items-center justify-between mt-12 mb-8 z-50">
                <div className="flex items-center gap-2 ">
                    <Gem className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold ">GemPlay</h1>
                </div>
                <Button aria-label="Settings" className="text-white" style={{ padding: "1.2rem 1rem" }}>
                    <UserIcon className="h-5 w-5" /> Login
                </Button>
            </header>

            <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center gap-8 mt-24 z-50">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                        Welcome to <span className="text-[#72be4f] [text-shadow:0_0_2px_#72be4f,0_0_20px_#72be4f,0_0_20px_#72be4f]">GemPlay</span>
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Unleash your creativity and craft amazing stories with our intuitive tools.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link to="/create">
                        <Button className="h-16 text-lg gap-2 rounded-full shadow-lg hover:shadow-xl transition-all text-white" size="lg" style={{ padding: "0 3rem" }}>
                            <>
                                <Cog className="h-5 w-5" />
                                Settings
                            </>
                        </Button>
                    </Link>

                    <Link to="/create">
                        <Button className="h-16 text-lg gap-2 rounded-full shadow-lg hover:shadow-xl transition-all text-white" size="lg" style={{ padding: "0 3rem" }}>
                            <>
                                <Plus className="h-5 w-5" />
                                Create Story
                            </>
                        </Button>
                    </Link>
                    <Link to="/create">
                        <Button className="h-16 text-lg gap-2 rounded-full shadow-lg hover:shadow-xl transition-all text-white" size="lg" style={{ padding: "0 3rem" }}>
                            <>
                                <HelpCircle className="h-5 w-5" />
                                Help
                            </>
                        </Button>
                    </Link>
                </div>


                <div className="w-full mt-8">
                    <h3 className="text-xl font-semibold mb-4">Recent Stories</h3>
                    {recentStories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentStories.map((story, index) => <StoryCard key={index} story={story} />)}
                        </div>
                    ) : (
                        <div className="text-left">
                            <p className="text-muted-foreground mb-2">No stories saved. Create one to get started</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

