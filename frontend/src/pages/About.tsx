
import {
  BookOpen,
  Building2,
  Eye,
  Target,
  HeartHandshake,
  GraduationCap,
  Scale,
  Landmark,
  Award,
  Users,
  ScrollText,
} from "lucide-react";

import sujatamohapatra from "../assets/sujatamohapatra.jpeg";
import shashwateeshantishuddha from "../assets/shashwateeshantishuddha.jpeg";
import kalingakesharimohapatra from "../assets/kalingakesharimohapatra.jpeg";
import utkalkesharimohapatra from "../assets/utkalkesharimohapatra.jpeg";
import susilkumarmohapatra from "../assets/susilkumarmohapatraa.png";
import Reveal from "@/components/common/Reveal";

const NAVY = "#0B1F3A";
const GOLD = "#D4AF37";
const CREAM = "#F8F6F0";

const coreTeam = [
  {
    name: "Kalinga Keshari Mohapatra",
    designation: "Founder And Chairman",
    image: kalingakesharimohapatra,
  },
  {
    name: "Utkal Keshari Mohapatra",
    designation: "Founder And Secretary",
    image: utkalkesharimohapatra,
  },
  {
    name: "Sujata Mohapatra",
    designation: "Founder And Advisor",
    image: sujatamohapatra,
  },
  {
    name: "Shashwatee Shanti Shuddha",
    designation: "Vice Chairman",
    image: shashwateeshantishuddha,
  },
];

const objectives = [
  "To preserve and promote the cultural, spiritual and historical heritage associated with Lord Jagannath.",
  "To create awareness about the traditions, customs and religious practices of the Jagannath Temple.",
  "To support research, education and documentation related to the temple and its heritage.",
  "To provide authentic knowledge and useful information to devotees, researchers and the general public.",
  "To encourage social welfare, cooperation and community development.",
  "To preserve valuable knowledge for future generations.",
];

const authorEducation = [
  {
    year: "1980",
    degree: "Graduation",
    institution: "G.B. Mahavidyalaya (B), Puri",
  },
  {
    year: "1985",
    degree: "Bachelor Degree in Law",
    institution: "G.M. Law College, Puri",
  },
  {
    year: "1988",
    degree: "Post Graduate Degree in Political Science",
    institution: "Ravenshaw College, Cuttack",
  },
  {
    year: "1992",
    degree: "Post Graduate Degree in Law",
    institution: "Utkal University",
  },
];

export default function About() {
  return (
    <main
      className="overflow-hidden text-[#0B1F3A]"
      style={{ backgroundColor: CREAM }}
    >
      {/* HERO SECTION */}
      <section
        className="relative overflow-hidden px-5 py-20 text-white sm:py-24 lg:py-32"
        style={{ backgroundColor: NAVY }}
      >
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[#D4AF37]/20" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border border-[#D4AF37]/20" />

        <Reveal animation="fade-in-down" className="relative mx-auto max-w-7xl text-center">
          <span className="mb-5 inline-flex items-center gap-2  rounded-full border border-[#D4AF37]/50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            <Landmark size={15} />
            Our Foundation
          </span>

          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
            About <span className="text-[#D4AF37]">Us</span>
          </h1>

          <div className="mx-auto my-7 h-1 w-20 rounded-full bg-[#D4AF37]" />

          <p className="mx-auto max-w-3xl text-sm leading-8 text-white/80 sm:text-base lg:text-lg">
            Preserving heritage, promoting knowledge and inspiring future
            generations through dedication, service and cultural awareness.
          </p>
        </Reveal>
      </section>

      {/* FOUNDATION HISTORY */}
      <section className="px-5 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal animation="fade-in-left">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Why Choose
            </span>

            <h2 className="mt-4 text-2xl font-bold leading-snug text-[#0B1F3A] sm:text-4xl">
  Advocate Susil Kumar Mohapatra Memorial Foundation and{" "}
  <span className="text-[#D4AF37]">Educational Trust</span>
</h2>

            <div className="my-6 h-1 w-16 rounded-full bg-[#D4AF37]" />

            <p className="text-sm leading-8 text-gray-600 sm:text-base">
              Our foundation is dedicated to preserving and promoting the
              cultural, spiritual and historical heritage associated with
              Lord Jagannath. Through knowledge, research, awareness and
              community initiatives, we aim to connect people with the rich
              traditions and values that form an important part of our
              heritage.
            </p>

            <p className="mt-5 text-sm leading-8 text-gray-600 sm:text-base">
              We believe that preserving our traditions and sharing authentic
              knowledge with society is essential for building a culturally
              aware and responsible future generation.
            </p>
          </div>
          </Reveal>

          <Reveal animation="fade-in-right" delay={150}>
          <div className="relative">
            <div className="absolute -right-4 -top-4 h-full w-full rounded-2xl border-2 border-[#D4AF37]/50" />

            <div
              className="relative flex min-h-[300px] flex-col justify-center overflow-hidden rounded-2xl p-8 text-white sm:min-h-[390px] sm:p-12"
              style={{ backgroundColor: NAVY }}
            >
              <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
              <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full border border-white/10" />

              <Building2 size={48} className="relative mb-8 text-[#D4AF37]" />

              <h3 className="relative text-2xl text-white font-bold sm:text-3xl">
                Our Foundation
              </h3>

              <p className="relative mt-5 text-sm leading-8 text-white/80 sm:text-base">
                A commitment to heritage, knowledge, service and the
                preservation of timeless cultural values.
              </p>

              <div className="relative mt-8 h-1 w-16 rounded-full bg-[#D4AF37]" />
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT THE AUTHOR */}
      <section
        className="relative overflow-hidden px-5 py-16 text-white sm:py-20 lg:py-24"
        style={{ backgroundColor: NAVY }}
      >
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full border border-[#D4AF37]/10" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-[#D4AF37]/10" />

        <div className="relative mx-auto max-w-7xl">
          <Reveal animation="fade-in-down" className="mx-auto mb-12 max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              The Mind Behind The Book
            </span>

            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              About <span className="text-[#D4AF37]">Shri Susil Kumar Mohapatra
</span>
            </h2>

            <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#D4AF37]" />
          </Reveal>

          <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.7fr] lg:gap-16">

            {/* AUTHOR PROFILE CARD */}
            <Reveal animation="fade-in-left">
            <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-white/[0.06] shadow-2xl transition duration-500 hover:border-[#D4AF37]/70">
              <div className="relative p-5 sm:p-7">
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#D4AF37]/30 via-[#D4AF37] to-[#D4AF37]/30" />

                <div className="relative mx-auto max-w-[280px]">
                  <div className="absolute -inset-2 rounded-2xl border border-[#D4AF37]/50" />

                  <img
                    src={susilkumarmohapatra}
                    alt="Shri Susil Kumar Mohapatra"
                    className="relative aspect-[4/5] w-full rounded-2xl object-cover object-top shadow-xl"
                  />
                </div>

                <div className="px-2 pb-3 pt-8 text-center">
                  

                  <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                    Late Shri Susil Kumar Mohapatra
                  </h3>

                  <div className="mx-auto my-4 h-1 w-14 rounded-full bg-[#D4AF37]" />

                  <p className="text-sm font-semibold tracking-wide text-[#D4AF37]">
                    Advocate & Author
                  </p>
                </div>

                <div className="my-4 h-px bg-white/15" />

                <div className="space-y-5 px-2 pb-3 text-sm text-white/85">
                  <div className="flex items-start gap-3">
                    <GraduationCap
                      className="mt-0.5 shrink-0 text-[#D4AF37]"
                      size={21}
                    />
                    <p>Post Graduate in Political Science and Law</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Scale
                      className="mt-0.5 shrink-0 text-[#D4AF37]"
                      size={20}
                    />
                    <p>Practicing Advocate since 1987</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen
                      className="mt-0.5 shrink-0 text-[#D4AF37]"
                      size={20}
                    />
                    <p>Author of Jagannath Temple Manual</p>
                  </div>
                </div>
              </div>
            </div>
            </Reveal>

            {/* AUTHOR BIOGRAPHY */}
            <Reveal animation="fade-in-right" delay={150}>
            <div className="min-w-0">
              <h3 className="mb-5 text-xl font-bold text-[#D4AF37]">
                Biography
              </h3>

              <div className="space-y-5 text-sm leading-8 text-white/80 sm:text-base">
                <p>
                  The Author, Shri Susil Kumar Mohapatra, was born on
                  30.05.1959 to Sj. Deenabandhu Mohapatra and Jharan Devi,
                  in the vicinity of Gobindapur, which comes within the
                  district of Puri.
                </p>

                <p>
                  His primary education was at G.B. Vidya Pitha (B), Puri.
                  Subsequently, he graduated from G.B. Mahavidyalaya (B),
                  Puri, in the year 1980. He completed his Bachelor Degree
                  in Law in 1985 from G.M. Law College, Puri, and has been
                  practicing as an Advocate since 1987.
                </p>

                <p>
                  During his legal career, he has practiced in different
                  spheres of law, such as Revenue, Civil, Criminal, Consumer,
                  Sales Tax, Income Tax, CAT, SAT, Labour, MACT and
                  Endowment matters. He has handled numerous cases and has
                  also helped settle disputes between parties before the
                  initiation of proceedings before various forums.
                </p>

                <p>
                  During the period of his active practice, he completed
                  his Post Graduate Degree in Political Science from
                  Ravenshaw College, Cuttack, in 1988. Subsequently, he
                  completed his Post Graduate Degree in Law at Utkal
                  University in 1992.
                </p>

                <p>
                  He is regarded by the people of his locality and
                  recognized as a senior counsel. Although an inhabitant
                  of Bhubaneswar, Khurda district, he remains professionally
                  active in Cuttack. His motto is to provide legal justice
                  to people at large by every possible means.
                </p>

                <p>
                  Apart from his legal profession, he has earned a good
                  reputation through his legal opinions and cooperation
                  with various Non-Governmental Organizations. He has
                  extended his support and guidance to these organizations
                  and has been regarded as a pathfinder for future
                  generations.
                </p>

                <p>
                  We hope his devotion towards writing this book will
                  immensely help readers, lawyers, social workers, legal
                  professionals and others in meeting future requirements
                  relating to the{" "}
                  <strong className="text-[#D4AF37]">
                    JAGANNATH TEMPLE MANUAL.
                  </strong>
                </p>
              </div>

              {/* EDUCATIONAL QUALIFICATIONS */}
              <div className="mt-12">
                <h3 className="mb-7 text-xl font-bold text-[#D4AF37]">
                  Educational Qualifications
                </h3>

                <div className="space-y-5 border-l border-[#D4AF37]/50 pl-6">
                  {authorEducation.map((education) => (
                    <div key={education.year} className="relative">
                      <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-[#D4AF37] bg-[#0B1F3A]" />

                      <span className="text-xs font-bold tracking-wider text-[#D4AF37]">
                        {education.year}
                      </span>

                      <h4 className="mt-1 font-bold text-white">
                        {education.degree}
                      </h4>

                      <p className="mt-1 text-sm text-white/65">
                        {education.institution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* PUBLISHER NOTE */}
              <div className="mt-12 rounded-xl border border-[#D4AF37]/30 bg-white/[0.05] p-6 sm:p-8">
                <div className="mb-3 flex items-center gap-3 text-[#D4AF37]">
                  <Award size={22} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Publisher's Note
                  </span>
                </div>

                <p className="text-sm italic leading-8 text-white/80">
                  We hope his devotion towards writing this book will
                  immensely help readers, lawyers, social workers,
                  lawmen and others for future exigencies with regards
                  to Jagannath Temple Manual.
                </p>

                <p className="mt-5 text-right text-sm font-bold text-[#D4AF37]">
                  — Publisher
                </p>
              </div>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CORE TEAM */}
      <section className="px-5 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal animation="fade-in-down" className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              The People Behind Us
            </span>

            <h2 className="mt-4 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
              Our Core <span className="text-[#D4AF37]">Team</span>
            </h2>

            <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#D4AF37]" />

            <p className="mt-5 text-sm leading-7 text-gray-500 sm:text-base">
              Meet the dedicated individuals guiding our foundation with
              leadership, commitment and experience.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {coreTeam.map((member, index) => (
              <Reveal key={member.name} animation="zoom-in" delay={index * 100}>
              <div
                key={member.name}
                className="group overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-2xl"
              >
                {/* MEMBER PHOTO */}
                <div className="relative h-[320px] overflow-hidden bg-[#F8F6F0] sm:h-[350px]">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-[#0B1F3A]">
                      <Users size={65} strokeWidth={1} />
                      <span className="mt-4 text-xs font-medium text-gray-500">
                        Photograph Coming Soon
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B1F3A]/50 to-transparent" />
                </div>

                {/* MEMBER DETAILS - ROLE REMOVED */}
                <div className="relative px-5 pb-7 pt-6 text-center">
                  <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-20" />

                  <h3 className="text-lg font-extrabold leading-snug text-[#0B1F3A] sm:text-xl">
                    {member.name}
                  </h3>

                  <p className="mt-3 text-sm font-semibold leading-relaxed text-gray-500">
                    {member.designation}
                  </p>

                  <div className="mx-auto mt-5 h-px w-16 bg-[#D4AF37]/40" />
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FORMATION DETAILS */}
      {/* <section className="bg-white px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Our Beginning
            </span>

            <h2 className="mt-4 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
              Formation <span className="text-[#D4AF37]">Details</span>
            </h2>

            <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#D4AF37]" />
          </div>

          <div className="mx-auto max-w-4xl rounded-2xl border border-[#D4AF37]/25 bg-[#F8F6F0] p-7 sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-[#D4AF37]"
                style={{ backgroundColor: NAVY }}
              >
                <ScrollText size={28} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#0B1F3A]">
                  Formation of the Foundation
                </h3>

                <p className="mt-4 text-sm leading-8 text-gray-600 sm:text-base">
                  The foundation was established with the intention of
                  bringing together individuals committed to cultural
                  preservation, social awareness, research and the promotion
                  of traditional values.
                </p>

                <p className="mt-3 text-sm leading-8 text-gray-600 sm:text-base">
                  Guided by its founding members, the organization aims to
                  work towards meaningful initiatives that benefit society
                  and preserve important cultural knowledge.
                </p>

                <p className="mt-4 rounded-lg border-l-4 border-[#D4AF37] bg-white p-4 text-sm leading-7 text-gray-600">
                  <strong className="text-[#0B1F3A]">Note:</strong> Add the
                  foundation's official registration date, registration
                  number, registered address and legal formation details here
                  when available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* MISSION AND VISION */}
      <section className="px-5 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal animation="fade-in-down" className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Our Purpose
            </span>

            <h2 className="mt-4 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
              Mission & <span className="text-[#D4AF37]">Vision</span>
            </h2>
          </Reveal>

          <div className="grid gap-7 md:grid-cols-2">
  {/* OUR MISSION */}
  <Reveal animation="fade-in-left">
  <div
    className="rounded-2xl p-8 text-white shadow-lg transition duration-300  hover:-translate-y-2 sm:p-10"
    style={{ backgroundColor: NAVY }}
  >
    <div className="mb-7 flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
        <Target size={30} />
      </div>
    <h3 className="text-2xl font-bold text-white">Our Mission</h3>
    </div>

    <div className="mb-5 h-1 w-14 rounded-full bg-[#D4AF37]" />

    <p className="text-sm leading-8 text-white/80 sm:text-base">
      To preserve and promote the spiritual, cultural and historical
      heritage of Lord Jagannath by spreading authentic knowledge,
      encouraging research, creating awareness and contributing
      towards the welfare of society.
    </p>
  </div>
  </Reveal>

  {/* OUR VISION */}
  <Reveal animation="fade-in-right">
  <div className="rounded-2xl border border-[#D4AF37]/25 bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 sm:p-10">
    <div className="mb-7 flex items-center gap-4">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-[#D4AF37]"
        style={{ backgroundColor: NAVY }}
      >
        <Eye size={30} />
      </div>
      <h3 className="text-2xl font-bold text-[#0B1F3A]">
        Our Vision
      </h3>
    </div>

    <div className="mb-5 h-1 w-14 rounded-full bg-[#D4AF37]" />

    <p className="text-sm leading-8 text-gray-600 sm:text-base">
      To become a recognized center for cultural preservation,
      knowledge sharing and social development, ensuring that
      traditional wisdom and heritage remain meaningful for
      generations to come.
    </p>
  </div>
  </Reveal>
</div>
        </div>
      </section>

      {/* OBJECTIVES */}
      <section className="bg-white px-5 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal animation="fade-in-down" className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              What We Strive For
            </span>

            <h2 className="mt-4 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
              Our <span className="text-[#D4AF37]">Objectives</span>
            </h2>

            <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#D4AF37]" />
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {objectives.map((objective, index) => (
              <Reveal key={index} animation="zoom-in-up" delay={index * 80}>
              <div
                key={index}
                className="flex gap-4 rounded-xl border border-[#D4AF37]/20 bg-[#F8F6F0] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-md"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#D4AF37]"
                  style={{ backgroundColor: NAVY }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <p className="text-sm leading-7 text-gray-600">
                  {objective}
                </p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="px-5 py-16 sm:py-20" style={{ backgroundColor: CREAM }}>
        <Reveal animation="fade-in-up" className="mx-auto max-w-5xl">
        <div
          className="mx-auto max-w-5xl rounded-2xl px-7 py-12 text-center text-white sm:px-12 sm:py-16"
          style={{ backgroundColor: NAVY }}
        >
          <HeartHandshake
            size={40}
            className="mx-auto mb-6 text-[#D4AF37]"
          />

          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Preserving Heritage, Inspiring Generations
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            Together, let us preserve our cultural values, share knowledge
            and create a meaningful legacy for future generations.
          </p>

          <div className="mx-auto mt-8 h-1 w-16 rounded-full bg-[#D4AF37]" />
        </div>
        </Reveal>
      </section>
    </main>
  );
}
