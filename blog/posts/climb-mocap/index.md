---
Can you MoCap a parkour video?
---

Last week a parkour clip from [shaneparkour](https://www.instagram.com/shaneparkour/?hl=en) showed up in my feed — a wall climb, one handheld phone, the kind of shot you scroll past and then scroll back to. If you haven't fallen into his videos yet, fair warning: he has a huge library and the motions get progressively more unreasonable.
I got curious. Could we actually digitize this? One moving camera, a subject doing something genuinely hard, no markers, no mocap suit, no studio. The honest version of the question is the one I actually care about: if we can, is the result something an animator would touch? Or is cleaning up imperfect MoCap still more work than keyframing from scratch?
I don't know the answer. That's kind of why I'm writing this.

## Why this clip is a nightmare
A parkour wall climb from a handheld phone hits almost every failure mode markerless MoCap has:

- The camera is moving too. You can't lean on a static background to solve camera pose — the solver has to figure out where the camera is and where the person is, simultaneously, with nothing locked down.
- Heavy self-occlusion at contact. When the body folds against the wall, limbs disappear behind the torso, behind the wall itself, behind each other.
- Fast motion. Motion blur eats fine detail on arms and legs exactly when you need it most — mid-push, mid-rotation.
- Contact matters. A climb that doesn't look like it's actually touching the wall looks wrong instantly. Foot slide on the ground is forgiving; hand slide on a vertical surface is not.

Any one of these is hard. Together, they're the kind of shot that would normally get a "shoot it in a volume" answer.

## The pipeline
Broadly, the stages are what you'd expect for monocular human motion from video: [person detection and tracking → 2D pose estimation → lifting to 3D in a canonical space → camera pose / scene solve → temporal smoothing and contact-aware refinement → retargeting to a skeleton]. Some of it is off-the-shelf open source, some of it is Moverse's own optimization stack doing the heavy lifting on the parts that matter. End-to-end on this clip: under two minutes.
I'll save the full write-up for another post — this one's really about the output.

## The result
Below is a Rerun viewer with the raw solve. No cleanup, no retargeting polish, no animator pass — just what came out of the pipeline.

You should be able to orbit, pan, zoom, and inspect the scene directly in the blog post.

<div
  class="post-embed-card"
  data-rerun-viewer-url="https://storage.googleapis.com/ftpmoverse/public/rerun/parkour/climb.rrd"
  data-rerun-blueprint-url="https://storage.googleapis.com/ftpmoverse/public/rerun/parkour/parkour_climb.rbl"
  data-rerun-viewer-height="640"
  data-rerun-caption="Interactive DNA example rendered with the Rerun web viewer."
  data-rerun-reference="https://github.com/rerun-io/webpage_example/blob/main/docs/index.html"
  data-rerun-reference-label="Reference example"
>
  <div class="post-embed-frame" aria-label="Interactive Rerun viewer"></div>
</div>
<br>
A couple of things worth looking at specifically:

- The wall contact moment — watch whether the hands feel planted or floaty. This is usually where single-camera solves fall apart.
- The rotation through the climb — root orientation under fast camera motion is one of the hardest things to get right.
- The landing / recovery — the easy part, and a useful baseline for how clean the pipeline can be when conditions are friendly.

My honest read: decent. Not perfect. Feet are good, the overall shape of the motion is there, some of the finger and wrist detail at contact is clearly guessed rather than observed. For two minutes of compute on a clip that was never meant to be solved, I'll take it.

## The real question
Here's where I actually want input from people who'd use this.
If I handed you this as an FBX — silhouette right, timing right, rough contacts, some jitter, some limbs clearly wrong — is that a starting point that saves you time, or is it a cleanup job that costs you more time than keyframing from reference?
I've heard both answers from animators and I don't think there's one right one. It probably depends on the shot, the style, the deadline, and how much you trust the source. But I'd love to know where your line is: what does markerless MoCap have to get right before it earns a seat in your pipeline, and what's the thing it keeps getting wrong that makes you throw it out?
Reply, DM, whatever works. Genuinely asking.

## Why this is useful

- The post body stays easy to edit in Markdown.
- The interactive viewer still works as a real JavaScript embed.
- Later we can swap the hosted sample for one of your own `.rrd` recordings.

For a production post, we can also support multiple Rerun embeds in the same article or make the viewer URL configurable from front matter.
