---

AI-Based Synthesis for Complex Human Poses, Motions, and Interactions
---


![Hero image — the gradient human figures from the title slide](./assets/phd-defense/hero.png)

Einstein, in order to reflect the importance of motion in the definition of the universe, put forward the following sentence:

> *"Nothing happens until something moves."*

In the last years of my PhD, I felt it was right — though in quite different settings from what Albert Einstein had in mind.

Last month, I defended my PhD thesis at the University of Thessaly, titled **"AI-Based Synthesis for Complex Human Poses, Motions, and Interactions."** 
This post is my attempt to share what that actually means, like talking to my parents — without the equations, without the benchmark tables, and without assuming you've ever heard the words "motion capture" before. So if you are a bit technical, don't be too strict with my simplifications. 🙂

---

## So, what is motion capture?

Motion Capture, or MoCap, is the process of digitizing how a human moves. As a technology, it has its origins in the pioneering works of Étienne-Jules Marey and Eadweard Muybridge — two 19th century scientists who were obsessed with capturing movement on film long before anyone had heard of a computer.

![The Horse in Motion — the horse in motion](./assets/phd-defense/horse_in_motion.jpg)
*"The Horse in Motion” by Eadweard Muybridge*


We've come a long way since then. Motion capture is now everywhere, and you've probably already seen it without realizing it. If you're a film fan, you might know how James Cameron created the blue Na'vi in Avatar. If you follow the NBA, you may have heard about the league's recent initiative using motion capture to prevent player injuries. It also shows up in physiotherapy clinics, video game studios, and sports science labs around the world.

![Motion capture applications: film, VR, sport, rehabilitation](assets/phd-defense/mocap_applications.png)
*Motion capture in action — from blockbuster films to sports science and physical rehabilitation.*

The traditional way to do all of this is expensive and cumbersome. An actor suits up in a special outfit covered in reflective markers, high-end cameras track those dots from multiple angles, and software pieces together a 3D skeleton in real time. It works beautifully — but it costs a fortune, requires a dedicated lab, and demands hours of manual cleanup afterward.

The natural question is: *can we do better?* Can we make motion capture accessible to researchers, clinicians, game developers, and filmmakers who don't have a Hollywood budget?

The answer is yes — but getting there requires solving some genuinely hard problems.

---

## The ultimate goal — and the obstacles in the way

The dream is a **markerless** motion capture system: just cameras, no special suit, no reflective dots, no cleanup. Point the cameras at a person, and let the AI do the rest. Cheaper, faster, and available to anyone.

The problem is that achieving the accuracy of professional optical systems without any of that hardware is one of the long-standing open challenges in computer vision. When you strip away the markers and the controlled lab environment, three big adversaries emerge.

**Data bias.** AI models learn from data, and most motion capture datasets are dominated by everyday movements — walking, standing, the occasional jog. Complex poses like a martial arts kick, an acrobatic flip, or a deep yoga stretch are statistically rare and get largely ignored during training. The result is a model that handles ordinary movement well but falls apart the moment something unusual happens.

**Noise.** Low-cost cameras introduce signal noise. The AI keypoint detector introduces its own uncertainty. When both pile up, the reconstructed body can look wrong in subtle but important ways — joints drifting, limbs at implausible angles. Existing approaches to handle noise tend to require knowing the noise distribution in advance, or a lot of manual tuning. Neither is practical in the real world.

**Temporal inconsistency.** Even when each individual frame looks reasonable, frame-by-frame estimation is jittery and unstable. A person's knee shouldn't jump two centimeters between frames. This shaking and sliding makes the output unusable for most downstream applications.

![Summary diagram of the three adversaries](assets/summary_adversaries.png)
*The three core challenges addressed in the thesis: data bias, compound noise, and markerless MoCap.*

---

## What this thesis does about it

The central idea running through all three problems is **representation learning** — rather than hand-crafting rules about what human motion should look like, we teach the AI to build its own rich internal model of valid human poses, and then use that model as a guide when things get noisy or ambiguous.

For the **data bias** problem, we designed a framework that identifies rare "tail" poses in the training data and synthesizes new examples around them by intelligently interpolating between existing poses in the learned latent space. The model gets exposed to a much more complete picture of what the human body can do — not just what it does most of the time.

![SQUAD pose sampling sequence](assets/squad_sampling.png)
*Synthesizing new rare poses by interpolating between anchor poses on a learned hyperspherical latent space.*

For the **noise** problem, we built a solver that automatically assigns a different level of trust to each detected body landmark based on the AI's own uncertainty. A stable torso point gets trusted fully; a flickering, partially occluded hand gets down-weighted. No prior knowledge of the noise distribution needed, no manual configuration.

For the **temporal inconsistency** problem, we developed **BundleMoCap** — a method that solves multiple frames simultaneously as a bundle, rather than independently one at a time. By optimizing across a short window of frames together, the solution naturally becomes smooth and physically plausible, without any explicit smoothness terms baked in.

![BundleMoCap smooth motion sequence](assets/bundlemocap_sequence.png)
*BundleMoCap produces smooth, temporally consistent motion by solving a bundle of frames jointly.*

> 💡 *[A looping GIF of the real-time output would go great right here.]*

---

## From the lab to the real world

Beyond evaluating these methods on standard benchmarks, we wanted to see how they hold up in practice. So we actually built and deployed a real system: three low-cost depth cameras arranged around a small room, connected to a laptop. A person walks in wearing 53 small reflective markers — much simpler than a full optical suit — the system detects and labels them automatically, fits a 3D body model, and produces a smooth animation in real time, without any manual cleanup.

![Real-world deployment diagram](assets/deployment.png)
*Our low-cost capture setup: three depth cameras arranged at ~120° intervals around a 4-metre capture space.*

We demonstrated it live at **ICCV 2023 in Paris** and **CVMP 2023 in London**. Seeing people walk up, move around, and watch their movements translated into a digital character on a screen in real time — that never got old.

![ICCV 2023 demo photo](assets/iccv_demo.png)
*Live demo at ICCV 2023, Paris. Visitors could see their movements captured and reconstructed in real time.*

---

## So, does it work?

Yes — and better than I expected in some cases. The combined approach consistently outperforms prior methods across multiple benchmarks, particularly on rare and complex poses where existing systems struggle most. Crucially, improving performance on difficult cases doesn't come at the expense of performance on everyday ones. The system also runs efficiently enough for real-time use on modest hardware, which matters a lot if the goal is broad accessibility.

---

## What's next?

There's plenty of ground left to cover. A few directions I'm most curious about:

- **Hand and finger motion** — extending BundleMoCap to the full hand is technically challenging but would unlock a lot of new applications
- **Better body representations** — using geometrically richer spaces (like SO(3) rotation groups) to model joints more faithfully
- **Clothed, in-the-wild people** — handling occlusion, loose clothing, and multi-person scenes robustly is still an open problem

---

## Publications

The work in this thesis led to the following publications:

- *Towards Scalable and Real-time Markerless Motion Capture* — **IEEE VR 2022**
- *Noise-in, Bias-out: Balanced and Real-time MoCap Solving* — **ICCV 2023**
- *BundleMoCap: Efficient, Robust and Smooth Motion Capture from Sparse Multiview Videos* — **CVMP 2023**
- *BundleMoCap++* — **Computer Vision and Image Understanding (Journal)**
- *From bias to balance: Leverage representation learning for bias-free MoCap solving* — **Computer Vision and Image Understanding (Journal)**
- *Robust and Efficient AI Motion Capture* — **Laval Virtual**

---

The defense is done. And something has moved.

---

*The slides are available [here]. If you want to dig into the technical details, feel free to reach out.*