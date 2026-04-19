---

AI-Based Synthesis for Complex Human Poses, Motions, and Interactions
---


![Hero image — the gradient human figures from the title slide](./assets/phd-defense/hero.png)

Einstein once said:

> *"Nothing happens until something moves."*

He was right as always — and yet, for most of human history, motion has been surprisingly hard to capture, measure, and understand digitally. My PhD thesis, which I defended last month at the University of Thessaly, is about finding new ways to do exactly that: digitise human motion without the bulky equipment needed before.

In this first post, I'll try to explain how we tried to achieve that in plain terms — no benchmark tables, no too much technical language, thus if you're technical, go easy on my simplifications. 🙂

---

## So, what is motion capture?

Motion Capture, or MoCap, is the process of digitizing how a human moves. As a technology, it has its origins in the pioneering works of Étienne-Jules Marey and Eadweard Muybridge — two 19th century scientists who were obsessed with capturing movement on film long before anyone had heard of a computer.

![The Horse in Motion — the horse in motion](./assets/phd-defense/horse_in_motion.jpg)
*"The Horse in Motion" by Eadweard Muybridge. &copy; The respective copyright owners.*

We've come a long way since then. MoCap is now everywhere, and you've probably already seen it without realizing it. If you're a film fan, you might know how James Cameron created the blue Na'vi in Avatar. If you follow the NBA, you may have heard about the league's recent initiative using markerless MoCap to prevent player injuries. It also shows up in physiotherapy clinics, video game studios, and sports science labs around the world.

![Motion capture applications: film, VR, sport, rehabilitation](assets/phd-defense/mocap_applications.png)
*Motion capture in action — from blockbuster films to sports science and physical rehabilitation. &copy; The respective copyright owners.*

The traditional way to do all of this is expensive and cumbersome. An actor suits up in a tight uniform covered in reflective markers, infrared cameras track those dots, and algorithms solve for a 3D human skeleton in real time. It works almost perfectly — but it costs a fortune, requires a dedicated lab, and can even require manual cleanup in cases where those markers are occluded.

![Optical Mocap](assets/phd-defense/optical_mocap.png)
*Optical MoCap — an actor wears a suit covered with reflective markers while infrared cameras track them.*

So, the question that arises is: *can we do better*.
Can we make MoCap accessible to a wider audience who don't have a huge budget — without needing the suits and the markers?

---

## The ultimate goal — and why go markerless?

From my point of view, the essential goal is a **markerless** MoCap system: just RGB cameras, no special suit, no reflective markers, and ideally no cleanup.

The problem is that achieving the accuracy of high-end optical systems without any of that hardware is one of the long-standing open challenges in computer vision. Within this thesis we tried reaching this goal incrementally, solving three core challenges. 

**Data bias.** AI models learn from data, and most MoCap datasets are dominated by everyday movements — walking, standing, the occasional jog. Complex poses like a martial arts kick, an acrobatic flip, or a deep yoga stretch are statistically rare and get largely ignored during training. The result is an AI model that handles ordinary movement well but falls apart the moment something unusual happens.

**Noise.** Low-cost cameras introduce signal noise, while at the same time the AI models introduce their own noise. When both are combined, we get a new type of compound noise that is not effectively handled by existing solvers. Particularly, existing approaches require knowing the noise distribution in advance, or a lot of manual tuning — neither of which is practical in the real world.

**Temporal inconsistency.** The biggest challenge in markerless MoCap. The final motion suffers from high-frequency jitter introduced by 2D keypoint estimators, making it unusable for most downstream applications. Most existing approaches add extra temporal smoothing terms to the optimisation process, which makes the tuning process even harder.

![Summary diagram of the three adversaries](assets/phd-defense/summary_adversaries.jpg)
*The three core challenges addressed in the thesis: data bias, compound noise, and markerless MoCap.*

---

## What this thesis does about it

Differentiating from existing approaches, we aim at solving these challenges using **representation learning**. To make it clearer, imagine mapping all valid human poses onto a manifold — a structured space that has certain properties we can exploit for each of the tasks above.

For the **data bias** problem, we designed a framework that identifies rare "tail" poses in the training data and synthesizes new examples around them by interpolating between them in the learned latent space.
That way, the trained AI models can perform similarly on both rare and common poses.

![Training framework](assets/phd-defense/data_bias.png)
*High-level overview of the introduced training framework.*

For the **noise** problem, we built a neural-solver that automatically assigns a different level of trust to each landmarky. For instance, a torso landmark with less noise as it is mostly visible from the cameras gets trusted fully; while a flickering, partially occluded hand landmark gets down-weighted. No prior knowledge of the noise distribution needed, no manual configuration.

![Noise framework](assets/phd-defense/noise_concept.jpg)
*Noise modelling.*

For the **temporal inconsistency** problem, we introduced **BundleMoCap** — a method that solves for specific keyframes and synthesises the intermediate frames by interpolating poses on the manifold. By optimizing across a short window of frames together, the solution naturally becomes smooth and physically plausible, without defining explicit smoothness terms.

![BundleMoCap smooth motion sequence](assets/phd-defense/bundlemocap_sequence.png)
*BundleMoCap produces smooth, temporally consistent motion by solving a bundle of frames jointly.*

---

## Demos

To demonstrate the practicality of the proposed methods apart from evaluating them in public benchmarks, we presented them live at **ICCV 2023 in Paris** and **CVMP 2023 in London**. 

Even under these challenging conditions, the outcome was very good, and participants seemed to enjoy seeing their digital character on a screen in real time.

![ICCV 2023 demo photo](assets/phd-defense/iccv_demo.png)
*Live demo at ICCV 2023, Paris.*

---

## Publications

The work in this thesis led to the following publications, where you can find more details for each of the developed methods:

- *Towards Scalable and Real-time Markerless Motion Capture* — **IEEE VR 2022**
- *Noise-in, Bias-out: Balanced and Real-time MoCap Solving* — **ICCV 2023**
- *BundleMoCap: Efficient, Robust and Smooth Motion Capture from Sparse Multiview Videos* — **CVMP 2023**
- *BundleMoCap++* — **Computer Vision and Image Understanding (Journal)**
- *From bias to balance: Leverage representation learning for bias-free MoCap solving* — **Computer Vision and Image Understanding (Journal)**
- *Robust and Efficient AI Motion Capture* — **Laval Virtual**

---

*The slides are available [here](https://drive.google.com/file/d/158_pWuDLy8B3pJZpg5iTa-y9OvktbxY8/view?usp=drive_link). If you want to dig into the technical details, feel free to reach out.*