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

The traditional way to do all of this is expensive and cumbersome. An actor suits up in a tight uniform covered in reflective markers, infrared cameras track those dots, and algorithms solve for a 3D skeleton in real time. It works almost perfectly — but it costs a fortune, requires a dedicated lab, and it could even require manual cleanup, in cases where markers are occluded.

![Optical Mocap](assets/phd-defense/optical_mocap.png)
*Optical Mocap — an actor wears a suit covered with reflective markers while infrared cameras track them.*

So, the question that arises is: *can we do better?* Can we make motion capture accessible to researchers, clinicians, game developers, and filmmakers who don't have a huge budget without needing the suits, and the markers?

---

## The ultimate goal — and why markerless ?

From my point of view, the essential goal is a **markerless** motion capture system: just RGB cameras, no special suit, no reflective markers, and ideally no cleanup. 

The problem is that achieving the accuracy of high-end optical systems without any of that hardware is one of the long-standing open challenges in computer vision. So we opt for reaching this goal increamentally, as shown below. 

**Data bias.** AI models learn from data, and most motion capture datasets are dominated by everyday movements — walking, standing, the occasional jog. Complex poses like a martial arts kick, an acrobatic flip, or a deep yoga stretch are statistically rare and get largely ignored during training. The result is an AI model that handles ordinary movement well but falls apart the moment something unusual happens.

**Noise.** Low-cost cameras introduce signal noise. The AI keypoint detector introduces its own uncertainty. When both combined, we have a new type of noise, which is not effectively handled by existing solvers. Particularly, existing approaches require knowing the noise distribution in advance, or a lot of manual tuning. Neither is practical in the real world.

**Temporal inconsistency.** The biggest challenge in markerless MoCap. The final motion suffers from high-frequency noise introduced  by the 2d keypoint estimators, making it unusable for most downstream applications. Most of the existing approaches, add extra temporal smoothing terms in the optimisation process, hardening the tuning process even more.

![Summary diagram of the three adversaries](assets/phd-defense//summary_adversaries.jpg)
*The three core challenges addressed in the thesis: data bias, compound noise, and markerless MoCap.*

---

## What this thesis does about it

Differentiating from existing aproaches, we aim at solving these challenges using **representation learning**. To make it clearer, imagine that we are trying to map all the valid human poses into a manifold, which may have certain properties useful for the task we are discussing.

For the **data bias** problem, we designed a framework that identifies rare "tail" poses in the training data and synthesizes new examples around them by intelligently interpolating between existing poses in the learned latent space. 
That way, the trained AI models can perfom similarly to the rare and normal poses.

![Training framework](assets/phd-defense/data_bias.png)
*High level overview of the introduced training framework.*

For the **noise** problem, we built a solver that automatically assigns a different level of trust to each detected body landmark based on the AI's own uncertainty. A stable torso point gets trusted fully; a flickering, partially occluded hand gets down-weighted. No prior knowledge of the noise distribution needed, no manual configuration.

![Noise framework](assets/phd-defense/noise_concept.jpg)
*Noise Modelling Concept.*

For the **temporal inconsistency** problem, we developed **BundleMoCap** — a method that solves for specific keyframes and synthesise the intermediate frames by interpolating poses on the manifold. By optimizing across a short window of frames together, the solution naturally becomes smooth and physically plausible, without any explicit smoothness terms baked in.

![BundleMoCap smooth motion sequence](assets/phd-defense/bundlemocap_sequence.png)
*BundleMoCap produces smooth, temporally consistent motion by solving a bundle of frames jointly.*

---

## From the lab to the real world

Beyond evaluating these methods on standard benchmarks, we wanted to see how they hold up in practice.

We demonstrated it live at **ICCV 2023 in Paris** and **CVMP 2023 in London**. Seeing people walk up, move around, and watch their movements translated into a digital character on a screen in real time — that never got old.

![ICCV 2023 demo photo](assets/phd-defense/iccv_demo.png)
*Live demo at ICCV 2023, Paris.*

---

## Conclusions?

We thorougly proved that the combined approach consistently outperforms prior methods across multiple benchmarks, particularly on rare and complex poses where existing systems struggle most. Crucially, improving performance on difficult cases doesn't come at the expense of performance on everyday ones.

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

*The slides are available [here]. If you want to dig into the technical details, feel free to reach out.*