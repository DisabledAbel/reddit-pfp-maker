import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HowToReddit = () => {
  return (
    <section id="how-to-reddit" aria-labelledby="how-to-reddit-title" className="mt-10">
      <Card>
          <CardHeader>
            <CardTitle id="how-to-reddit-title">How to set as your Reddit profile picture</CardTitle>
            <CardDescription>
              Follow these quick steps to use your generated 256×256 image on Reddit.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium">Desktop (new Reddit)</h3>
              <ol className="mt-2 list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  Go to <a className="underline underline-offset-4" href="https://www.reddit.com/settings/profile" target="_blank" rel="noreferrer noopener">reddit.com/settings/profile</a>.
                </li>
                <li>Under Profile picture, click Upload and select your 256×256 image.</li>
                <li>Click Save.</li>
                <li>
                  Tip: If your Snoo avatar hides the photo, toggle off "Show avatar" or choose
                  "Profile picture" instead of "Avatar".
                </li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium">Mobile app</h3>
              <ol className="mt-2 list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                <li>Open Reddit and tap your avatar.</li>
                <li>My profile → Edit profile.</li>
                <li>Change profile picture → Upload/Take photo.</li>
                <li>Save.</li>
              </ol>
            </div>
          </CardContent>
      </Card>
    </section>
  );
};

export default HowToReddit;
