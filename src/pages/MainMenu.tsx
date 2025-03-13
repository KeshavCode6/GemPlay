import Background from "@/components/Background";
import { StoryCard } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Gem, HelpCircle, MoveRight, Plus, UserIcon } from "lucide-react";
import { useState, useEffect, SetStateAction } from "react";
import { Link, useNavigate } from "react-router";

export default function MainMenu() {
  const [session, setSession] = useState<Session | null>(null);
  const [recentStories, setRecentStories] = useState<any[]>([]); // Recent stories
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();

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

    supabase.auth.getUser().then((data) => {
      setSignedIn(data.data.user != null);
      getStories();
    });

    return () => subscription.unsubscribe();
  }, []);

  const getStories = async () => {
    let stories: any[] = [];
    const user = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("stories")
      .select("name, created_at, thumbnail_path")
      .eq("user", user.data.user?.email)
      .limit(2)
      .order("created_at", { ascending: false });
    data?.forEach(async (obj) => {
      let { data } = await supabase.storage
        .from("exported_videos")
        .getPublicUrl(obj.thumbnail_path);
      const date = new Date(obj.created_at);

      const story: any = {
        title: obj.name,
        created: date.toLocaleDateString(),
        coverImage: data.publicUrl,
      };

      stories.push(story);
    });
    setRecentStories(stories);
  };

  // Logout function
  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  // Determines whether to show a login or logout button based on session state
  function topButton() {
    if (!session) {
      return (
        <Link to="/login">
          <Button className="text-white" style={{ padding: "1.2rem 1rem" }}>
            <UserIcon className="h-5 w-5" /> Login
          </Button>
        </Link>
      );
    } else {
      return (
        <Button
          className="text-white"
          style={{ padding: "1.2rem 1rem" }}
          onClick={logout}
        >
          <UserIcon className="h-5 w-5" /> Logout
        </Button>
      );
    }
  }

  return (
    <div className="h-screen relative bg-amber-50 flex flex-col items-center p-4 md:p-8">
      <Background /> {/* Background component */}
      {/* Header Section */}
      <header className="w-full max-w-4xl flex items-center justify-between mt-12 mb-8 z-50">
        <div className="flex items-center gap-2 ">
          <Gem className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold ">GemPlay</h1>
        </div>
        {topButton()} {/* Dynamic login/logout button */}
      </header>
      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center gap-8 mt-24 z-50">
        {/* Welcome Section */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome to{" "}
            <span className="text-[#72be4f] [text-shadow:0_0_2px_#72be4f,0_0_20px_#72be4f,0_0_20px_#72be4f]">
              GemPlay
            </span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Unleash your creativity and craft amazing stories with our intuitive
            tools.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link to="/create">
            <Button
              className="h-16 text-lg gap-2 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
              size="lg"
              style={{ padding: "0 3rem" }}
            >
              <>
                <Plus className="h-5 w-5" />
                Create
              </>
            </Button>
          </Link>
          <Link to="/help">
            <Button
              className="h-16 text-lg gap-2 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
              size="lg"
              style={{ padding: "0 3rem" }}
            >
              <>
                <HelpCircle className="h-5 w-5" />
                Help
              </>
            </Button>
          </Link>
        </div>

        {/* Recent Stories Section */}
        <div className="w-full mt-8 h-100%">
          {signedIn ? (
            <div>
              <div className="flex flex-row gap-6">
                <h3 className="text-xl font-semibold mb-4">Recent Stories</h3>
                <Link to="/library">
                  <Button className="text-white">
                    See More
                    <MoveRight></MoveRight>
                  </Button>
                </Link>
              </div>

              {recentStories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentStories.map((story, index) => (
                    <Dialog key={index}>
                      <DialogTrigger>
                        <StoryCard story={story} />
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
          ) : (
            <div></div>
          )}
        </div>
      </main>
    </div>
  );
}
