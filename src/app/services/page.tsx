import Link from "next/link";

const SERVICES = [
  {
    title: "Athletic Development (High School)",
    image: "/services_high.jpg",
    schedule: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday — 1 hr 30 min",
    slug: "high-school",
  },
  {
    title: "Athletic Development (University/College)",
    image: "/services_uni.jpg",
    schedule: "Tuesday, Wednesday, Thursday, Friday, Saturday — 1 hr 30 min",
    slug: "university",
  },
  {
    title: "Women's Strength & Stretch",
    image: "/services_women.jpg",
    schedule: "Wednesday — 1 hr 30 min",
    slug: "women",
  },
  {
    title: "Men's Strength & Conditioning",
    image: "/services_men.jpg",
    schedule: "Monday, Wednesday — 1 hr 30 min",
    slug: "men",
  },
];

export default function ServicesPage() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-16">
        {SERVICES.map((service) => (
          <div key={service.title} className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-black sm:text-3xl">
              {service.title}
            </h2>

            <div className="mt-6 aspect-[16/9] w-full overflow-hidden rounded-lg">
              <img
                src={service.image}
                alt={service.title}
                className="h-full w-full object-cover object-center"
              />
            </div>

            <p className="mt-6 text-sm text-neutral-700 sm:text-base">
              {service.schedule}
            </p>

            <Link
              href={`/register?type=${service.slug}`}
              className="mt-6 rounded-md bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-roseGold"
            >
              Book Now
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
