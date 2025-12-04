"use client";

import { useState } from "react";
import Image from "next/image";
import RainbowText from "@/components/RainbowText";

type FrameCardData = {
  id: number;
  frameSrc: string;
  imageSrc: string;
  title: string;
  subtitle: string; 
  description: string;
};

const frames: FrameCardData[] = [
  {
    id: 1,
    frameSrc: "/assets/frame_0_0.svg",
    imageSrc: "/images/samuel.jpeg",
    title: "Samuel",
    subtitle: "GH: swangtree\nFavorite gift:\nMilkis!",
    description:
      "As SWE Project Manager, I organized and led project members and developed backend API service.",
  },
  {
    id: 2,
    frameSrc: "/assets/frame_0_1.svg",
    imageSrc: "/images/liam.jpeg",
    title: "Liam",
    subtitle: "GH: Liam Hochman\nFavorite gift:\nmonkey antiques.",
    description: "As Web Dev Project Manager, I organized and led project members and developed the simulation's frontend and features.",
  },
  {
    id: 3,
    frameSrc: "/assets/frame_0_2.svg",
    imageSrc: "/images/justin.jpeg",
    title: "Justin",
    subtitle: "GH: jsong-dong\nFavorite gift:\nanything crochet",
    description:
      "I implemented random matching and max-utility matching algorithms in the backend.",
  },
  {
    id: 4,
    frameSrc: "/assets/frame_0_3.svg",
    imageSrc: "/images/charlotte.jpeg",
    title: "Charlotte",
    subtitle: "GH: CharlotteWangv587\nFavorite gift:\npottery/art",
    description:
      "I designed and implemented the dashboard and wired the frontend state to the API (group data, preferences, draw results).",
  },
  {
    id: 5,
    frameSrc: "/assets/frame_1_0.svg",
    imageSrc: "/images/cole.jpeg",
    title: "Cole",
    subtitle: "GH: cjuyematsu\nFavorite gift:\nclothes",
    description: "I designed and implemented the results page.",
  },
  {
    id: 6,
    frameSrc: "/assets/frame_1_1.svg",
    imageSrc: "/images/stefanie.jpeg",
    title: "Stefanie",
    subtitle: "GH: stefanienguy\nFavorite gift:\nAnything tech",
    description: "I designed the dashboard and Max Fairness Algorithm (how to make no one sad with the matching :) ).",
  },
  {
    id: 7,
    frameSrc: "/assets/frame_1_2.svg",
    imageSrc: "/images/joanna.jpeg",
    title: "Joanna",
    subtitle: "GH: 23jlam\nFavorite gift:\nconcert tickets",
    description:
      "As part of the simulation team, I worked on the implementation of the white elephant simulation.",
  },
  {
    id: 8,
    frameSrc: "/assets/frame_1_3.svg",
    imageSrc: "/images/sam.jpeg",
    title: "Sam",
    subtitle: "GH: samuelbingham07\nFavorite gift:\nboard/video games",
    description:
      "As Product Manager and Web Design lead, I managed the project vision, created the visuals, and designed & implemented this about page.",
  },
];


const frameTitleColor: Record<number, string> = {
  1: "#6bd79e",
  5: "#6bd79e",

  2: "#ffe66b",
  6: "#ffe66b",

  3: "#ff9b6b",
  7: "#ff9b6b",

  4: "#7fb5ff",
  8: "#7fb5ff",
};


function FrameCard({ frame }: { frame: FrameCardData }) {
  const [isOpen, setIsOpen] = useState(false);
  // Frames that should have their SVG "zoomed in" by ~10%
  const enlargedFrames = [1, 3, 4, 7, 8];
  const isEnlarged = enlargedFrames.includes(frame.id);
  const subtitleLines = frame.subtitle.split("\n");
  const giftIndex = subtitleLines.findIndex((line) =>
    line.toLowerCase().startsWith("favorite gift:")
  );
  const subtitleTop =
    giftIndex >= 0
      ? subtitleLines.slice(0, giftIndex).join("\n")
      : frame.subtitle;
  const subtitleGift =
    giftIndex >= 0 ? subtitleLines.slice(giftIndex).join("\n") : "";

  return (
    <div
      className="relative mx-auto"
      style={{ width: "280px", height: "360px" }} // locked size, slightly smaller
    >
      {/* SVG frame */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            transform: isEnlarged ? "scale(1.1)" : "scale(1)",
            transformOrigin: "center",
          }}
        >
          <Image
            src={frame.frameSrc}
            alt={`Decorative frame ${frame.id}`}
            fill
            sizes="(max-width: 768px) 90vw, 360px"
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Inner content area */}
      <div className="relative flex h-full flex-col px-6 pt-8 pb-8">
        {/* Image + title */}
        <div className="flex items-center justify-center mb-4 relative">
          {/* Portrait image (unchanged, just slightly shorter height from your last version) */}
          <div className="relative w-[80%] h-[140px] sm:h-[170px] rounded-xl overflow-hidden bg-pareto-light/80 translate-y-2 sm:translate-y-3">
            <Image
              src={frame.imageSrc}
              alt={frame.title}
              fill
              sizes="(max-width: 768px) 80vw, 320px"
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Two-row title: name + smaller subtitle */}
          <h3
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-2 mt-[160px]"
            style={{ color: frameTitleColor[frame.id] }}
          >
            <span className="block font-display text-3xl sm:text-3xl">
              {frame.title}
            </span>
            <span className="block font-display text-sm sm:text-base mt-[8px] leading-[1.05] whitespace-pre">
              {subtitleTop}
            </span>
            {subtitleGift && (
              <span className="block font-display text-sm sm:text-base mt-[6px] leading-[1.05] whitespace-pre">
                {subtitleGift}
              </span>
            )}
          </h3> 
        </div>

        {/* Description dropdown */}
        <div className="w-full mt-[150px] sm:mt-[160px]">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 text-left w-full"
            style={{ color: frameTitleColor[frame.id] }}
          >
            <span className="font-display text-base sm:text-lg">Project Role:</span>
            <span className="text-xl sm:text-2xl leading-none">
              {isOpen ? "▴" : "▾"}
            </span>
          </button>
          {isOpen && (
            <div className="px-2 py-3">
              <p className="text-sm sm:text-base text-white leading-relaxed chalk-text whitespace-pre-line">
                {frame.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="flex bg-pareto-dark text-white min-h-screen">

      <main className="w-full ml-[200px]">
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">

          {/* HEADER */}
          <header className="mb-10 sm:mb-12 text-center">
            <h1 className="mb-4">
              <RainbowText
                text="About Pareto Presents"
                className="text-3xl sm:text-4xl md:text-5xl"
              />
            </h1>
          </header>

          {/* MISSION + HOW IT WORKS */}
          <section className="mb-12 sm:mb-16 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl mb-4 text-pareto-pink">
                Our mission
              </h2>
              <p className="chalk-text text-sm sm:text-base text-white mb-3">
                Pareto Presents was made to help groups give gifts that feel
                thoughtful, without the awkwardness of guessing what a friend wants or the chaos of
                figuring out logistics.
              </p>
              <p className="chalk-text text-sm sm:text-base text-white mb-3">
                Whether it&apos;s Secret Santa, birthdays, or just-because presents,
                we want organizers to feel confident that everyone is seen, included,
                and excited about what they receive.
              </p>
              <p className="chalk-text text-sm sm:text-base text-white">
                At the same time, we care a lot about preserving the surprise and
                delight that make gifting feel magical — not mechanical.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl mb-4 text-pareto-yellow">
                How it works
              </h2>
              <ul className="list-disc list-inside space-y-2 chalk-text text-sm sm:text-base text-white">
                <li>We collect lightweight preference data from your group.</li>
                <li>We generate pairings & gift suggestions tailored to your people.</li>
                <li>Organizers can review, tweak, or fully override suggestions.</li>
              </ul>
            </div>
          </section>

          {/* TEAM GRID */}
          <section className="pb-56">
            <header className="mb-8 sm:mb-10 text-center">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl mb-3 text-pareto-orange">
                Meet the team
              </h2>
              <p className="chalk-text text-sm sm:text-base text-white max-w-4xl mx-auto">
                A team of 8 students who like gifting, data, and building tools that
                make life a little easier and more fun!
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-y-48 gap-x-10">
              {frames.map((frame) => (
                <FrameCard key={frame.id} frame={frame} />
              ))}
            </div>
          </section>

          {/* P-AI CREDIT */}
          <section className="mb-16 rounded-2xl border border-white/10 bg-pareto-dark/60 px-6 py-8 sm:px-8 sm:py-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="flex-1">
              <h2 className="font-display text-2xl sm:text-3xl mb-3 text-pareto-green">
                Built at 5C P-ai
              </h2>
              <p className="chalk-text text-sm sm:text-base text-white mb-3">
                Pareto Presents is a project incubated by <span className="chalk-text">5C P-ai</span>,
                a cross-campus computer science club at the Claremont Colleges.
              </p>
              <p className="chalk-text text-sm sm:text-base text-white mb-3">
                P-ai brings together CS engineers to build tools for real communities
                with a focus on AI usage.
              </p>
              <p className="chalk-text text-sm sm:text-base text-white">
                Pareto Presents is a fun experiment turned product about how algorithms
                can support the human touch behind gift-giving.
              </p>
            </div>

            <div className="flex-1 w-full">
              <div className="rounded-xl bg-white/5 border border-white/15 px-5 py-4">
                <h3 className="font-display text-xl mb-2 text-pareto-blue">
                  Credit & contact
                </h3>
                <p className="chalk-text text-sm sm:text-base text-white mb-3">
                  Maintained by the Pareto Presents within 5C P-ai.
                </p>
                <p className="chalk-text text-xs sm:text-sm text-white">
            <a
              href="https://5cpai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-pareto-blue"
            >
              5cpai.com
            </a>
          </p>
              </div>
            </div>
          </section>

        </section>
      </main>
    </div>
  );
}
