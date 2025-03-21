import Background from "@/components/Background";
import Header from "@/components/Header";
import { StoryCard } from "@/components/StoryCard";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

export default function LibraryScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [recentStories, setRecentStories] = useState<any[]>([]); // Recent stories

  // Fetch user session on component mount and listen for authentication changes
  useEffect(() => {
    setRecentStories([]);
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );

    getStories();

    return () => subscription.unsubscribe();
  }, []);

  const getStories = async () => {
    let stories: any[] = [];
    const user = await supabase.auth.getUser();

    const { data } = await supabase
      .from("stories")
      .select("name, created_at, thumbnail_path, video_path")
      .eq("user", user.data.user?.email)
      .order("created_at", { ascending: false });
    data?.forEach(async (obj) => {
      let { data: thumb } = await supabase.storage
        .from("exported_videos")
        .getPublicUrl(obj.thumbnail_path);

      let { data: video } = await supabase.storage
        .from("exported_videos")
        .getPublicUrl(obj.video_path);
      const date = new Date(obj.created_at);

      const story: any = {
        title: obj.name,
        created: date.toLocaleDateString(),
        coverImage: thumb.publicUrl,
        video: video.publicUrl,
      };

      console.log(story.video);

      stories.push(story);
    });
    setRecentStories(stories);
  };

  return (
    <div className="h-screen relative bg-amber-50 flex flex-col items-center p-4 md:p-8">
      <Background /> {/* Background component */}
      {/* Header Section */}
      <Header />
      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center gap-8 mt-16 z- overflow-y-scroll h-100%">
        <div className="w-full h-full">
          <div>
            {recentStories.length > 0 && session ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentStories.map((story, index) => (
                  <StoryCard key={index} story={story} />
                ))}
              </div>
            ) : (
              <div className="text-left">
                <p className="text-muted-foreground mb-2">
                  No stories saved. Create one to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
