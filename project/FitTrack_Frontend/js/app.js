document.addEventListener("DOMContentLoaded", () => {
  // Basahin at isulat ang data sa session storage ng browser.
  const read = (key) => {
    try {
      return JSON.parse(sessionStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };
  const write = (key, value) => sessionStorage.setItem(key, JSON.stringify(value));

  // I-escape ang special HTML characters para ligtas ipakita ang user-provided na text.
  const safe = (value) =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character]));

  // Ipakita ang pangalan ng user at kasalukuyang petsa sa dashboard.
  const name = sessionStorage.getItem("fittrackName");
  const displayName = document.getElementById("displayName");
  if (displayName && name) displayName.textContent = name;

  const today = document.getElementById("todayDate");
  if (today) {
    today.textContent = new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Demo login: kunin ang pangalan mula sa email at buksan ang dashboard.
  const login = document.getElementById("loginForm");
  if (login) {
    login.addEventListener("submit", (event) => {
      event.preventDefault();
      sessionStorage.setItem(
        "fittrackName",
        document.getElementById("email").value.split("@")[0] || "User"
      );
      location.href = "dashboard.html";
    });
  }

  // I-check kung magkapareho ang password bago tapusin ang demo registration.
  const register = document.getElementById("registerForm");
  if (register) {
    register.addEventListener("submit", (event) => {
      event.preventDefault();
      if (document.getElementById("regPass").value !== document.getElementById("confirmPass").value) {
        return alert("Passwords do not match.");
      }
      sessionStorage.setItem("fittrackName", document.getElementById("name").value.trim());
      alert("Demo registration complete. No account was saved.");
      location.href = "dashboard.html";
    });
  }

  // Buksan ang logout confirmation kapag pinindot ang alinmang logout button.
  const modal = document.getElementById("logoutModal");
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.onclick = () => (modal.hidden = false);
  });

  // Isara ang logout confirmation at manatili sa kasalukuyang page.
  const cancelLogout = document.getElementById("cancelLogout");
  if (cancelLogout) cancelLogout.onclick = () => (modal.hidden = true);

  // Burahin ang pangalan ng user sa session at bumalik sa home page.
  const confirmLogout = document.getElementById("confirmLogout");
  if (confirmLogout) {
    confirmLogout.onclick = () => {
      sessionStorage.removeItem("fittrackName");
      location.href = "index.html";
    };
  }

  // Ipakita o itago ang sidebar navigation sa mobile view.
  const toggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  if (toggle && sidebar) toggle.onclick = () => sidebar.classList.toggle("open");

  // I-save ang bagong workout at i-refresh ang workout list at dashboard stats.
  const workoutForm = document.getElementById("workoutForm");
  if (workoutForm) {
    document.getElementById("date").value = new Date().toISOString().slice(0, 10);
    workoutForm.onsubmit = (event) => {
      event.preventDefault();
      const workouts = read("workouts");
      workouts.unshift({
        date: date.value,
        exercise: exercise.value,
        muscle: muscle.value,
        sets: sets.value,
        reps: reps.value,
        weight: weight.value,
        duration: Number(duration.value),
      });
      write("workouts", workouts);
      renderWorkouts();
      workoutForm.reset();
      date.value = new Date().toISOString().slice(0, 10);
      alert("Workout added for this browser session only.");
    };
  }

  // Gumawa ng workout table rows para sa history o workout tracker page.
  function renderRows(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const workouts = read("workouts");
    element.innerHTML = workouts.length
      ? workouts
          .map(
            (workout) =>
              `<tr><td>${safe(workout.date)}</td><td>${safe(workout.exercise)}<br><small>${safe(workout.muscle)}</small></td><td>${workout.sets} × ${workout.reps}</td><td>${workout.weight} kg</td><td>${workout.duration} min</td></tr>`
          )
          .join("")
      : '<tr><td colspan="5">No workout entries yet.</td></tr>';
  }

  // I-update ang workout tables, totals, progress at recent activity sa dashboard.
  function renderWorkouts() {
    renderRows("workoutRows");
    renderRows("historyRows");

    const workouts = read("workouts");
    const workoutCount = document.getElementById("workoutCount");
    if (workoutCount) workoutCount.innerHTML = `${workouts.length} <small>sessions</small>`;

    const totalMinutes = workouts.reduce((sum, workout) => sum + workout.duration, 0);
    const minuteCount = document.getElementById("minuteCount");
    if (minuteCount) minuteCount.innerHTML = `${totalMinutes} <small>mins</small>`;

    const progressCount = document.getElementById("progressCount");
    if (progressCount) progressCount.textContent = workouts.length;

    const progressMinutes = document.getElementById("progressMinutes");
    if (progressMinutes) progressMinutes.textContent = `${totalMinutes} mins`;

    const recent = document.getElementById("recent");
    if (recent) {
      recent.innerHTML = workouts.length
        ? workouts
            .slice(0, 4)
            .map(
              (workout) =>
                `<p><b>${safe(workout.exercise)}</b> — ${safe(workout.date)}, ${workout.duration} mins</p>`
            )
            .join("")
        : 'No workouts yet. <a href="workouts.html">Record your first workout</a>.';
    }
  }

  // I-render ang workout data sa sandaling mag-load ang page.
  renderWorkouts();

  // I-save ang bagong fitness goal at i-refresh ang listahan at bilang nito.
  const goalForm = document.getElementById("goalForm");
  if (goalForm) {
    goalForm.onsubmit = (event) => {
      event.preventDefault();
      const goals = read("goals");
      goals.unshift({
        title: goalTitle.value,
        type: goalType.value,
        target: goalTarget.value,
        date: goalDate.value,
      });
      write("goals", goals);
      renderGoals();
      goalForm.reset();
    };
  }

  // Ipakita ang mga goal at i-update ang goal counters sa goals at progress pages.
  function renderGoals() {
    const list = document.getElementById("goalsList");
    if (list) {
      const goals = read("goals");
      list.innerHTML = goals.length
        ? goals
            .map(
              (goal) =>
                `<article><b>${safe(goal.title)}</b><p>${safe(goal.type)} · Target: ${safe(goal.target)} · Due: ${safe(goal.date)}</p></article>`
            )
            .join("")
        : "No goals yet.";
    }

    const goalCount = document.getElementById("goalCount");
    if (goalCount) goalCount.innerHTML = `${read("goals").length} <small>goals</small>`;

    const progressGoals = document.getElementById("progressGoals");
    if (progressGoals) progressGoals.textContent = read("goals").length;
  }

  // I-render ang goal data sa sandaling mag-load ang page.
  renderGoals();

  // I-filter ang exercise tutorials ayon sa search text at napiling category.
  const search = document.getElementById("tutorialSearch");
  const filter = document.getElementById("categoryFilter");
  function applyFilter() {
    document.querySelectorAll("#tutorialGrid article").forEach((card) => {
      const term = search ? search.value.toLowerCase() : "";
      const category = filter ? filter.value : "all";
      card.style.display =
        card.dataset.name.includes(term) &&
        (category === "all" || card.dataset.category === category)
          ? ""
          : "none";
    });
  }
  if (search) search.oninput = applyFilter;
  if (filter) filter.onchange = applyFilter;

  // Magpakita ng demo message para sa tutorial na wala pang naka-link na video.
  document.querySelectorAll(".video-demo").forEach((button) => {
    button.onclick = () =>
      alert(`Tutorial video for ${button.dataset.exercise} will be linked in a later version.`);
  });
});
