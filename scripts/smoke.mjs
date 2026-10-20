const BASE = "http://localhost:3000";
const results = [];
function check(name, cond, extra = "") {
  results.push({ name, pass: !!cond, extra });
  if (!cond) console.log("FAIL:", name, extra);
}

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error("ADMIN_PASSWORD is required. Run with: node --env-file=.env scripts/smoke.mjs");
  process.exit(2);
}

async function main() {
  // 1. Page content
  const home = await (await fetch(BASE + "/")).text();
  check("home has Welcome", home.includes("Welcome"));
  check("home has tagline", home.includes("4QPH is the place to develop"));
  check("home has home_1 image", home.includes("home_1.JPG"));
  check("home has home_2 image", home.includes("home_2.JPG"));

  const about = await (await fetch(BASE + "/about")).text();
  check("about has Stronger for Longer", about.includes("Stronger for Longer"));
  check("about has About heading", about.includes(">About<") || about.includes("About</h2>") || about.includes("About"));
  check("about has JOHN", about.includes("JOHN"));
  check("about has PIZZA", about.includes("PIZZA"));
  check("about has about_1", about.includes("about_1.JPG"));
  check("about has about_2", about.includes("about_2.jpg"));
  check("about navy section 3", about.includes("bg-[#2B4160]"));

  const services = await (await fetch(BASE + "/services")).text();
  check("services card 1", services.includes("Athletic Development (High School)"));
  check("services card 2", services.includes("Athletic Development (University/College)"));
  check("services card 3", services.includes("Women&#x27;s Strength &amp; Stretch") || services.includes("Women's Strength"));
  check("services card 4", services.includes("Men&#x27;s Strength &amp; Conditioning") || services.includes("Men's Strength"));
  check("services has Book Now links to /register", (services.match(/href="\/register\?type=/g) || []).length >= 4);

  const register = await (await fetch(BASE + "/register")).text();
  check("register heading", register.includes("Register a Session Today!"));

  // 2. Image handling: object-cover + aspect containers + sticky nav + logo object-contain
  const allHtml = home + about + services + register;
  check("images use object-cover", allHtml.includes("object-cover"));
  check("fixed aspect-ratio containers", allHtml.includes("aspect-"));
  check("logo uses object-contain", allHtml.includes("object-contain"));
  check("sticky navbar", allHtml.includes("sticky") && allHtml.includes("top-0"));
  check("logo referenced", allHtml.includes("4Q_Logo.png"));

  // 3. Validation (no cookie needed)
  const badEmail = await fetch(BASE + "/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: 1, firstName: "A", lastName: "B", email: "not-an-email", participants: 1, gender: "Male" }),
  });
  check("bad email rejected", badEmail.status === 400, "status " + badEmail.status);

  const zeroPart = await fetch(BASE + "/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: 1, firstName: "A", lastName: "B", email: "a@b.com", participants: 0, gender: "Male" }),
  });
  check("participants 0 rejected", zeroPart.status === 400, "status " + zeroPart.status);

  const emptyName = await fetch(BASE + "/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: 1, firstName: "", lastName: "B", email: "a@b.com", participants: 1, gender: "Male" }),
  });
  check("empty name rejected", emptyName.status === 400, "status " + emptyName.status);

  const badGender = await fetch(BASE + "/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: 1, firstName: "A", lastName: "B", email: "a@b.com", participants: 1, gender: "Unknown" }),
  });
  check("bad gender rejected", badGender.status === 400, "status " + badGender.status);

  // 4. Admin auth
  const noAuth = await fetch(BASE + "/api/sessions");
  check("sessions list requires auth", noAuth.status === 401, "status " + noAuth.status);

  const wrongPw = await fetch(BASE + "/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "wrong" }),
  });
  check("wrong password rejected", wrongPw.status === 401, "status " + wrongPw.status);

  const login = await fetch(BASE + "/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  check("correct password accepted", login.status === 200, "status " + login.status);
  const cookie = login.headers.get("set-cookie") || "";
  check("login sets cookie", cookie.includes("4qph_admin"), cookie);

  const cookieHeader = cookie.split(";")[0];

  // 5. Admin creates a session (future date)
  const future = new Date();
  future.setDate(future.getDate() + 3);
  const date = iso(future);
  const create = await fetch(BASE + "/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ date, startTime: "10:00", endTime: "11:30", type: "Athletic Development (High School)", notes: "Test session" }),
  });
  const createJson = await create.json();
  check("admin creates session", create.status === 201, "status " + create.status + " " + JSON.stringify(createJson));
  const sessionId = createJson.session && createJson.session.id;

  const badCreate = await fetch(BASE + "/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ date: "not-a-date", startTime: "10:00", endTime: "11:00", type: "Athletic Development (High School)" }),
  });
  check("invalid session date rejected", badCreate.status === 400, "status " + badCreate.status);

  // 6. Availability
  const avail = await fetch(BASE + `/api/availability?date=${date}&type=${encodeURIComponent("Athletic Development (High School)")}`);
  const availJson = await avail.json();
  check("availability returns session", avail.status === 200 && Array.isArray(availJson.sessions) && availJson.sessions.some((s) => s.id === sessionId), JSON.stringify(availJson));

  // 7. Customer booking (valid) — should send 2 emails, no warning
  if (sessionId) {
    const book = await fetch(BASE + "/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, firstName: "Jane", lastName: "Doe", email: "jane.doe@example.com", participants: 2, gender: "Female" }),
    });
    const bookJson = await book.json();
    check("valid booking accepted", book.status === 201, "status " + book.status + " " + JSON.stringify(bookJson));
    check("no email warning (both emails sent)", book.status === 201 && !bookJson.warning, JSON.stringify(bookJson.warning));

    // 8. Admin can list bookings
    const bookings = await fetch(BASE + "/api/bookings", { headers: { Cookie: cookieHeader } });
    const bookingsJson = await bookings.json();
    check("admin lists bookings", bookings.status === 200 && Array.isArray(bookingsJson.bookings) && bookingsJson.bookings.some((b) => b.email === "jane.doe@example.com"), "count=" + (bookingsJson.bookings || []).length);

    // 9. Cancel session (soft delete)
    const del = await fetch(BASE + `/api/sessions/${sessionId}/cancel`, { method: "POST", headers: { Cookie: cookieHeader } });
    check("admin cancels session", del.status === 200, "status " + del.status);
  }

  console.log("\n=== RESULTS ===");
  const passed = results.filter((r) => r.pass).length;
  console.log(`${passed}/${results.length} passed`);
  results.filter((r) => !r.pass).forEach((r) => console.log("  FAIL:", r.name, r.extra));
  process.exit(results.some((r) => !r.pass) ? 1 : 0);
}

main().catch((e) => { console.error("SCRIPT ERROR", e); process.exit(2); });
