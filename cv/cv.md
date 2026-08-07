---
name: Georgios Albanis
headline: Computer Vision & Machine Learning Researcher
tagline: Markerless motion capture and digital humans.
location: Thessaloniki, Greece
updated: August 2026
links:
  - Website | https://galbanis.dev
  - Google Scholar | https://scholar.google.gr/citations?user=2o1nthIAAAAJ&hl
  - GitHub | https://github.com/tzole1155
  - LinkedIn | https://www.linkedin.com/in/georgiosalbanis/
  - Book a call | https://calendar.app.google/TdC9ERvxQbFZZ2in6
---

<!--
  ─────────────────────────────────────────────────────────────────────
  HOW TO EDIT THIS CV
  ─────────────────────────────────────────────────────────────────────
  Everything on the CV page comes from this file. Plain markdown, plus
  four small conventions:

  1.  ## Section Title {layout}
      The {layout} suffix is optional and picks how the section renders:
        {timeline}   default — dated entries (experience, education)
        {chips}      "**Label** — a, b, c" lines become tag chips
        {stats}      "Value | Caption" list items become a stat row
        {cards}      ### entries become cards (projects, awards)
        {plain}      leave the markdown exactly as written

  2.  Add {full-only} to a section to hide it in "Condensed" view
      (and in the condensed PDF): ## Publications {timeline} {full-only}

  3.  Inside a {timeline} or {cards} section:
        ### Role — Organisation
        *2021 – Present · Athens, Greece*     <- the part with a year
                                                 becomes the date rail
        - bullet
        - bullet

  4.  <div id="cv-publications"></div> pulls the list straight from
      /data/publications.json so the CV and the homepage never drift.
      Optional: data-limit="10" or data-ids="id-a,id-b".
  ─────────────────────────────────────────────────────────────────────
-->

## Profile {plain}

Computer vision researcher and engineer working on human digitization. Adding a small piece on redefining motion capture technology, making it accessible to wider audiences and impacting more people. 

## At a Glance {stats}

- 20 | Peer-reviewed publications
- 4 | Top-tier venues (ICCV, CVPR, SIGGRAPH, NeurIPS-W)
- 8+ | Years building vision systems
- 1 | Co-founder of **Moverse**

## Experience {timeline}

### Co-founder, CVML Lead & Operations  — Moverse
*2022 – Present · Thessaloniki, Greece* <!-- ⚠ VERIFY start year -->

- Co-founded [Moverse](https://moverse.ai/) to democratise motion capture — replacing marker suits and studios with consumer RGB cameras.
- Built the markerless MoCap stack behind the product.
- Supervised interns and junior colleagues during their time at Moverse.
- Keep track of Moverse's day to day operations and planning.


### Research Associate — CERTH / ITI, Visual Computing Lab
*2018 – 2022 · Thessaloniki, Greece* <!-- ⚠ VERIFY dates -->

- Delivered computer vision research across EU-funded consortia, working with international academic and industrial partners.
- **Pano3D** (CVPR 2021): built a holistic benchmark and baseline for 360° monocular depth estimation, plus a decomposed distribution-shift benchmark presented at a NeurIPS 2021 workshop.
- **Diminished-reality AR**: an AI system that removes and replaces indoor furniture in panoramic scenes, taken through to a user-facing AR experience.
- **Drone control in AR**: single-handed gesture control and contextualised video-feed visualisation for first responders.
- **Medical imaging**: volume-of-interest aware networks for rapid chest-CT COVID-19 risk assessment, in collaboration with clinical partners.
- Released open benchmarks and code that other groups adopted, and co-authored the reproducibility study *On End-to-End 6DOF Object Pose Estimation*.

### Software Engineer — Noriker Power Ltd
*2017 – 2018 · Cheltenham, United Kingdom*

- Engineering at a fast-growing startup around energy storage power plants.

## Education {timeline}

### PhD, Human Motion Capture & Digital Humans — University of Thessaly
*2026 · Lamia, Greece*

- Thesis: *AI-Based Synthesis for Complex Human Poses, Motions, and Interactions.*
- Representation learning for bias-free, noise-robust, temporally smooth markerless MoCap.

### MEng / Diploma, Electrical & Computer Engineering — Aristotle University of Thessaloniki
*2015 · Thessaloniki, Greece*

- Five-year integrated Master's degree.

## Selected Research {cards}

### Markerless MoCap
*2023 – 2025 · ICCV, CVMP, CVIU*

- **Noise-in, Bias-out** (ICCV 2023): a neural solver that learns per-landmark trust instead of requiring a known noise distribution or hand-tuned weights — real-time and balanced.
- **BundleMoCap / BundleMoCap++** (CVMP 2023, CVIU 2024): solve a bundle of keyframes and interpolate on the manifold, so temporal smoothness falls out of the formulation rather than an extra loss term.
- **From Bias to Balance** (CVIU 2025): synthesise rare "tail" poses by latent-space interpolation, closing the gap between common and complex motion.

### Digital Humans & Neural Avatars
*2024 – 2025 · SIGGRAPH Asia, preprint*

- **On the Skinning of Gaussian Avatars**: diagnosing and fixing the artefacts that linear blend skinning introduces into the non-linear rotation properties of Gaussians.
- **Controlling Diversity in Single-shot Motion Synthesis** (SIGGRAPH Asia 2024 Posters): generating varied motion from a single example.

### Real-Time & Low-Cost Capture Systems
*2022 – 2023 · SIGGRAPH Real-Time Live!, CVPR, IEEE VR*

- **Suit Up: AI MoCap** — live markerless capture on stage at SIGGRAPH 2023 Real-Time Live!
- **A Low-Cost & Real-Time Motion Capture System** (CVPR 2022 Demo) and *Towards Scalable and Real-time Markerless Motion Capture* (IEEE VR 2022).

### 360° Perception & Mixed Reality
*2021 – 2023 · CVPR, NeurIPS-W, IMX*

- **Pano3D** — a benchmark and strong baseline for 360° depth estimation, with an explicit decomposition of distribution shift into three distinct kinds.
- **PanoDR** and the AI-based DR-enhanced AR system — diminished reality for indoor scenes, through to user-generated AR experiences.

## Technical Skills {chips}

- **Research areas** — Markerless motion capture, Human pose & shape estimation, Representation learning, Multi-view geometry, Digital Humans
- **Languages** — Python, CUDA, Bash
- **ML stack** — PyTorch, NumPy/SciPy, ONNX, TensorRT, OpenCV, Hydra, Rerun
- **3D & graphics** — SMPL/SMPL-X, FBX · BVH · glTF · USD, Blender, Unity, three.js
- **Engineering** — Docker, Git, CI/CD, cloud deployment
- **Beyond the code** — Research roadmapping, technical writing, team building & mentoring, partner and customer collaboration

## Publications {full-only}

<div id="cv-publications"></div>

## Service & Community {cards} {full-only}

### Peer Review
*Ongoing*

- Reviewer for ICRA, ISMAR, Neurocomputing.

### Talks & Demos
*2023 – Present*
- *Robust and Efficient AI Motion Capture* — Laval Virtual 2025, Laval.
- *BundleMoCap: Efficient, Robust and Smooth Motion Capture from Sparse Multiview Videos* — CVIU 2023, London.
- *Noise-in, Bias-out: Balanced and Real-time MoCap Solving* — ICCV 2023 CV4Metaverse Workshop, Paris.
- *Suit Up: AI MoCap* — SIGGRAPH 2023 Real-Time Live!, Los Angeles.

### Writing
*Ongoing*

- Long-form technical writing at [galbanis.dev/blog](https://tzole1155.github.io/blog/) on motion capture, digital humans, and the research behind them.

## Languages {chips}

- **Greek** — Native
- **English** — Full professional proficiency
