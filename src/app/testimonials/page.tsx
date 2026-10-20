import InstagramEmbed from "@/components/InstagramEmbed";

const TESTIMONIALS = [
  {
    title: "Christian Salerno",
    url: "https://www.instagram.com/reel/DEaEJYXxJs3/",
    description:
      "Christian Salerno - Windsor University - LB- Class of 2027",
  },
  {
    title: "Filipo Marcello",
    url: "https://www.instagram.com/reel/C49FzJbp6pk/",
    description:
      "Filipo Marcello - University of Toronto - Kicker- class of 2027",
  },
  {
    title: "Victor Raposo",
    url: "https://www.instagram.com/reel/DIuJdbyS69b/",
    description: "Victor Raposo - University of Toronto - Offensive Linemen",
  },
  {
    title: "John Gamal",
    url: "https://www.instagram.com/reel/DENSnjiRv3z/",
    description: "John Gamal - Father - 41 years young",
  },
];

export default function TestimonialsPage() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-4xl font-bold text-black sm:text-5xl">
          OUR CLIENTS
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-black sm:text-base">
          Here at 4th Quarter, we take pride in the training we offer our
          clients. With an evidence-based, science-backed approach, we ensure
          that our clients are driven by their results. Here are a few examples
          of some before and after pictures as well as a few testimonial videos
        </p>

        <div className="mt-12 flex flex-col">
          {TESTIMONIALS.map((item, index) => (
            <div key={item.title}>
              {index > 0 && (
                <div aria-hidden="true" className="h-px w-full bg-roseGold" />
              )}
              <section className="py-10 text-center">
                <h2 className="text-xl font-bold text-black sm:text-2xl">
                  {item.title}
                </h2>
                <InstagramEmbed url={item.url} />
                <p className="mt-4 text-sm text-black">{item.description}</p>
              </section>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
