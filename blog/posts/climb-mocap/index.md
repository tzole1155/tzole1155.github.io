---
Can you MoCap a parkour video?
---

Last week a parkour clip from [shaneparkour](https://www.instagram.com/shaneparkour/?hl=en) showed up in my feed and got my attention — an impressive wall climb, captured by a single moving handheld phone.

Working in the field of human digitisation and motion capture, a natural question for me is: could we actually digitise this? One moving camera, an actor doing something genuinely hard, no markers, no mocap suit, no studio, random lighting conditions. And if we can, would the result be of sufficient quality for downstream applications — for instance, good enough that an animator would prefer to clean it up rather than keyframe from scratch?

Before answering that, let's look at why this is so hard.

## Why this clip is challenging

A parkour wall climb from a handheld phone is one of the most demanding motions to digitise:

- Beyond the single-camera constraint, the camera itself is moving — so we need to account for that in the actual motion solving.
- Heavy self-occlusions. The challenging motion means many body parts are not visible to the camera, and contact with the wall aggravates this further.
- Fast motion captured at phone-level FPS. This produces intense motion blur, which degrades the quality of the AI models involved.

## The pipeline

I'll keep this brief and save the full write-up for another post, since I want the focus here to be on the output motion. In short, we follow a two-stage approach: first we estimate the camera trajectory in the world frame using open-source tools, then we solve for the final body motion using some of our internal tools. Interestingly, this pipeline is quite fast and optimised to run on commodity-level GPUs (e.g. an NVIDIA 3060).

## The result

Below is a Rerun viewer (best viewed on desktop) with the outcome. **This is the raw result — no manual intervention, no postprocessing.** On the left you can see the motion in 3D alongside the camera position, and on the right the reference video. You should be able to orbit, pan, zoom, and inspect the scene directly in the blog post.

<div
  class="post-embed-card"
  data-rerun-viewer-url="https://storage.googleapis.com/ftpmoverse/public/rerun/parkour/climb.rrd"
  data-rerun-blueprint-url="https://storage.googleapis.com/ftpmoverse/public/rerun/parkour/parkour_climb.rbl"
  data-rerun-viewer-height="640"
  data-rerun-caption="Final motion and Camera Tracking. &#169; shaneparkour"
  data-rerun-reference="https://www.instagram.com/p/DHoeOkqNwI9/?hl=en"
  data-rerun-reference-label="Parkour climb"
>
  <div class="post-embed-frame" aria-label="Interactive Rerun viewer"></div>
</div>
<br>

## What do you think?

So — a single handheld phone clip of a parkour wall climb, digitised automatically with no cleanup. The motion is there, though some artifacts remain. The real question is whether a result like this is a starting point that saves professionals time, or a cleanup job that ends up costing more than keyframing from reference.

I'd love to hear your take on this. Feel free to reach out — I can also send you the final asset to experiment with.