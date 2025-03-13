import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  DialogHeader,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

// Each database record with the videos
export function StoryCard({ story }: { story: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden hover:shadow-md transition-shadow p-8 px-4 cursor-pointer h-50%">
          <CardContent>
            {/* Showing imoprtant info like the title, creation date, etc. */}
            <CardTitle className="text-lg">{story.title}</CardTitle>
            <CardDescription className="mb-4">
              Created {story.created}
            </CardDescription>
            <div className="bg-gray-100 w-full h-46 aspect-video rounded-lg">
              <img src={story.coverImage} alt="" />
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{story.title}</DialogTitle>
          <DialogDescription>{story.created}</DialogDescription>
        </DialogHeader>
        <video controls className="w-full">
          <source src={story.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </DialogContent>
    </Dialog>
  );
}
