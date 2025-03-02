import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

export function StoryCard({ story }: { story: any }) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow p-8 px-4 cursor-pointer">
            <CardContent >
                <CardTitle className="text-lg">{story.title}</CardTitle>
                <CardDescription className="mb-4">Created {story.created}</CardDescription>

                <div className="bg-gray-100 w-full h-46 aspect-video rounded-lg" />
            </CardContent>
        </Card>
    )
}