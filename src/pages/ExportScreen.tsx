import { useState } from "react";
import Background from "@/components/Background";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Download } from "lucide-react";
import { useLocation } from "react-router";

export default function ExportScreen() {
    const [videoName, setVideoName] = useState("");
    const [error, setError] = useState("");
    const location = useLocation();
    const videoUrl = location.state?.videoUrl;

    const handleDownload = () => {
        const trimmedName = videoName.trim();

        if (!trimmedName) {
            setError("Video name is required");
            return;
        }
        if (trimmedName.includes(" ")) {
            setError("Video name cannot have spaces!");
            return;
        }

        setError(""); // Clear errors if validation passes
    };

    return (
        <div className="h-screen relative bg-amber-50 flex flex-col items-center p-4 md:p-8">
            <Background />
            <Header />

            <div className="mt-28 z-50">
                <Card className="aspect-video max-w-xl p-8">
                    <CardHeader>
                        <CardTitle>Export Story</CardTitle>
                        <CardDescription>Name your story before exporting</CardDescription>
                    </CardHeader>

                    {videoUrl ? (
                        <video controls className="w-full">
                            <source src={videoUrl} type="video/webm" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <p className="text-red-500 mt-4">No recording found!</p>
                    )}
                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="videoname">Video Name</Label>
                                <Input
                                    id="videoname"
                                    value={videoName}
                                    onChange={(e) => setVideoName(e.target.value)}
                                />
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                            </div>
                            <div className="flex flex-row gap-3">
                                <Button className="text-white" onClick={handleDownload}>
                                    <Download />Download
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}