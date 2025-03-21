import { useEffect, useState } from "react";
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
import { Download, Upload } from "lucide-react";
import { useLocation } from "react-router";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ExportScreen() {
  const [videoName, setVideoName] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const videoUrl = location.state?.videoUrl;

  useEffect(() => {
    supabase.auth.getUser().then((data) => {
      setSignedIn(data.data.user != null);
    });
  }, []);

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
    if (trimmedName.length < 2 || trimmedName.length > 32) {
      setError("Video name has to be between 2 and 32 characters!");
      return;
    }

    setError(""); // Clear errors if validation passes
    downloadVideo();
  };

  const handleUpload = () => {
    const trimmedName = videoName.trim();

    if (!trimmedName) {
      setError("Video name is required");
      return;
    }
    if (trimmedName.includes(" ")) {
      setError("Video name cannot have spaces!");
      return;
    }
    if (trimmedName.length < 2 || trimmedName.length > 32) {
      setError("Video name has to be between 2 and 32 characters!");
      return;
    }
    setError(""); // Clear errors if validation passes
    uploadVideo();
  };

  const generateThumbnail = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = videoUrl;

      video.crossOrigin = "anonymous";
      video.currentTime = 0.5; // Capture a frame after 0.5 seconds
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 320; // Set a small size for the thumbnail
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Failed to create canvas context");

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject("Failed to generate thumbnail");
          },
          "image/jpeg",
          0.8
        );
      };

      video.onerror = () => reject("Error loading video");
    });
  };

  const uploadVideo = async () => {
    if (!videoUrl) return;

    const fileName = `videos/${videoName}.mp4`;
    const thumbnailFileName = `thumbnails/${videoName}.jpg`;

    console.log(videoUrl);

    let video = await fetch(videoUrl)
      .then((r) => r.blob())
      .then(
        (blobFile) => new File([blobFile], videoName, { type: "video/mp4" })
      );
    const { data, error: vidError } = await supabase.storage
      .from("exported_videos") // Replace with your actual bucket name
      .upload(fileName, video, {
        contentType: "video/mp4",
      });

    if (vidError) {
      console.error("Upload error:", vidError.message);
    } else {
      console.log("Video uploaded:", data);
      toast("Video uploaded successfully!");
    }

    // Generate and upload thumbnail
    try {
      const thumbnailBlob = await generateThumbnail();
      const { data: thumbData, error: thumbError } = await supabase.storage
        .from("exported_videos") // Replace with your bucket for thumbnails
        .upload(thumbnailFileName, thumbnailBlob, {
          contentType: "image/jpeg",
        });

      if (thumbError) {
        console.error("Thumbnail upload error:", thumbError.message);
      } else {
        console.log("Thumbnail uploaded:", thumbData);
        toast("Video & Thumbnail uploaded successfully!");
      }
    } catch (err) {
      console.error("Thumbnail generation error:", err);
    }

    await supabase.from("stories").insert({
      name: videoName,
      video_path: fileName,
      thumbnail_path: thumbnailFileName,
      user: (await supabase.auth.getUser()).data.user?.email,
    });
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    toast("Downloading video");
    console.log(videoUrl);

    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `${videoName}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  <Download />
                  Download
                </Button>
                <Button
                  className="text-white"
                  onClick={handleUpload}
                  disabled={!signedIn}
                >
                  <Upload />
                  Upload
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
