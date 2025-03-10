import Background from "@/components/Background";
import { ExportForm } from "@/components/ExportForm";
import Header from "@/components/Header";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRecording } from "@/lib/recorder";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Link } from "react-router";
import { toast } from "sonner";
import { boolean, z } from "zod";

const FormSchema = z.object({
  videoname: z.string().min(2, {
    message: "Video name must be at least 2 characters.",
  }),
});

export default function ExportScreen() {
  const { stopRecording, videoBlob } = useRecording();
  let [videoName, setVideoName] = useState(`${Date.now()}`);

  const generateThumbnail = (videoBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(videoBlob);
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

  const nameInvalid = (): boolean => {
    return videoName == "";
  };

  const uploadVideo = async () => {
    if (!videoBlob) return;

    if (nameInvalid()) {
      toast("Invalid name for story. Please enter a new name.");
    }

    const fileName = `videos/${videoName}.webm`;
    const thumbnailFileName = `thumbnails/${videoName}.jpg`;

    const { data, error } = await supabase.storage
      .from("exported_videos") // Replace with your actual bucket name
      .upload(fileName, videoBlob, {
        contentType: "video/webm",
      });

    if (error) {
      console.error("Upload error:", error.message);
    } else {
      console.log("Video uploaded:", data);
      alert("Video uploaded successfully!");
      return;
    }

    // Generate and upload thumbnail
    try {
      const thumbnailBlob = await generateThumbnail(videoBlob);
      const { data: thumbData, error: thumbError } = await supabase.storage
        .from("thumbnails") // Replace with your bucket for thumbnails
        .upload(thumbnailFileName, thumbnailBlob, {
          contentType: "image/jpeg",
        });

      if (thumbError) {
        console.error("Thumbnail upload error:", thumbError.message);
      } else {
        console.log("Thumbnail uploaded:", thumbData);
        alert("Video & Thumbnail uploaded successfully!");
      }
    } catch (err) {
      console.error("Thumbnail generation error:", err);
    }
  };

  const downloadVideo = () => {
    if (!videoBlob) return;
    if (nameInvalid()) {
      toast("Invalid name for story. Please enter a new name.");
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(videoBlob);
    link.download = "story.webm";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen relative bg-amber-50 flex flex-col items-center p-4 md:p-8">
      <Background />
      <Header />

      <div className="mt-28 z-50">
        <Card>
          <CardHeader>
            <CardTitle>Export Story</CardTitle>
            <CardDescription>Name your story before exporting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Video Name</Label>
                <Input id="videoname" />
              </div>
              <div className="flex flex-row gap-3">
                <Button onClick={downloadVideo}>Download</Button>
                <Button onClick={uploadVideo}>Save to Cloud</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
