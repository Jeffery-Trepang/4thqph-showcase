export default function HomePage() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col px-6 py-16 lg:flex-row lg:items-center lg:gap-12">
        {/* Left: large title only */}
        <div className="flex w-full flex-col justify-center lg:w-1/2">
          <h1 className="text-6xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
            Welcome
            <br />
            to 4th
            <br />
            Quarter
            <br />
            Performance
            <br />
            &amp; Health
          </h1>
        </div>

        {/* Right: images above, small text below */}
        <div className="mt-12 flex w-full flex-col lg:mt-0 lg:w-1/2">
          <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg lg:aspect-[3/4] lg:mt-16">
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/home_1.JPG`}
                alt="4th Quarter training"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg lg:aspect-square">
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/home_2.JPG`}
                alt="4th Quarter conditioning"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>

          <p className="mt-8 text-sm leading-relaxed text-neutral-300 sm:text-base">
            4QPH is the place to develop your strength, conditioning, and skills
            and become the best Athlete you can be. Our goal is to help athletes
            of all skill levels improve their abilities on and off the field.
          </p>
        </div>
      </div>
    </section>
  );
}
