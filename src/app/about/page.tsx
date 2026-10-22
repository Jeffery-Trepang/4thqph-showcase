export default function AboutPage() {
  return (
    <div>
      {/* Section 1 — black */}
      <section className="bg-black px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Stronger for Longer
          </h1>
          <p className="mt-8 text-sm leading-relaxed text-neutral-200 sm:text-base">
            The history of sport performance shows us that it&apos;s often not
            the fastest or the strongest that come out on top, but the ones who
            last the longest. Whether it be on the grid iron, in a 42km
            marathon or a 4 day/72 hole golf tournament, some of the biggest
            feats in sport performance are accomplished in the final minutes of
            the event. At 4th Quarter we foster this mentality of moving smart
            and staying strong right through to the final whistle.
          </p>
        </div>
      </section>

      {/* Section 2 — white */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg">
            <img
              src="/about_1.JPG"
              alt="4th Quarter coaching"
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-black">About</h2>
            <p className="mt-6 text-sm leading-relaxed text-neutral-700 sm:text-base">
              4th Quarter Performance and Health was developed out of a passion
              for fitness, performance, health and wellness. At 4th Quarter, a
              science driven approach is taken to achieve the individual goals
              of our clients. Whether it be developing the strength and
              endurance to perform at your peak in the final minutes of the 4th
              quarter in a championship game, or you simply want to make it
              through your day pain free by developing efficient strength and
              movement patterns, our coaches are there to provide the optimal
              training plan and environment to make those goals become reality.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-700 sm:text-base">
              All of our coaches bring a background in kinesiology to the
              table. Along with the scientific knowledge, our coaches have
              diverse experience in sport performance ranging from football,
              baseball, soccer and endurance sport which can be applied to
              ensure optimal programming. We approach health and fitness from a
              holistic point of view, taking into account the individual needs
              of our clients.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — navy */}
      <section className="bg-[#2B4160] px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg">
            <img
              src="/about_2.jpg"
              alt="John Piazza"
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              JOHN
              <br />
              PIAZZA
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-white/95 sm:text-base">
              John Piazza is a graduate of Queen&apos;s University with a
              Bachelor of Science Honors in Kinesiology. He currently holds a
              personal trainer certification from the National Strength and
              Conditioning Association (NSCA-cpt), and is currently completing
              his designation as a Certified Strength and Conditioning
              Specialist (NASM-CSCS). John is a former football, hockey and
              rugby player having played both football and hockey at
              competitive levels while continuing to play varsity football for
              the Queen&apos;s Gaels. In the last few years he&apos;s acted as
              an assistant coach to the York Toros hockey club and more
              recently he&apos;s been volunteering his time as a running back
              coach for the Etobicoke Eagles as well as for his Alumnus high
              school, Chaminade College School. His passion for sports and his
              ability to work with individuals at a wide range of age and
              training levels, athletic experience and by focusing on holistic
              health rather than purely performance based results creates an
              ideal environment to explore working out for the first time or
              work on more sport specific training.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
