document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const recipeList = document.getElementById('recipeList');
  const recipeDetails = document.getElementById('recipeDetailsContainer');
  const loader = document.getElementById('loader');
  const emptyState = document.getElementById('emptyState');

  async function fetchRecipes() {
    const query = searchInput.value.trim();
    if (!query) return;

    recipeList.innerHTML = '';
    recipeDetails.innerHTML = `
      <div class="h-full flex items-center justify-center text-slate-500 text-sm">
        <p>Loading recipe details preview...</p>
      </div>`;
    emptyState.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
      const data = await res.json();
      loader.classList.add('hidden');

      if (!data.meals) {
        recipeList.innerHTML = `<p class="text-slate-400 text-sm col-span-full">No recipes found for "<span class="text-emerald-300">${query}</span>".</p>`;
        recipeDetails.innerHTML = `
          <div class="h-full flex flex-col items-center justify-center text-center text-slate-500 text-sm">
            <p class="mb-1">No details to show.</p>
            <p class="text-xs text-slate-600">Try searching for another ingredient or recipe name.</p>
          </div>`;
        return;
      }

      recipeList.innerHTML = '';
      data.meals.forEach((meal, index) => {
        const li = document.createElement('li');
        li.className = [
          "group bg-slate-950/80 rounded-2xl overflow-hidden cursor-pointer",
          "border border-slate-800/80 hover:border-emerald-400/60",
          "hover:shadow-glow hover:shadow-emerald-500/40",
          "transition-all duration-300 ease-out",
          "transform hover:-translate-y-1 hover:scale-[1.02]",
          "flex flex-col"
        ].join(" ");

        li.innerHTML = `
          <div class="relative overflow-hidden">
            <img
              src="${meal.strMealThumb}"
              alt="${meal.strMeal}"
              class="w-full h-40 sm:h-44 object-cover transform group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent opacity-60 group-hover:opacity-70 transition-opacity"></div>
            <span
              class="absolute top-2 left-2 text-[0.65rem] font-medium px-2 py-0.5 rounded-full
                     bg-slate-950/80 text-slate-100 border border-slate-600/60">
              ${meal.strArea || 'Global'}
            </span>
          </div>
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-semibold text-base sm:text-lg mb-1 line-clamp-2 group-hover:text-emerald-300">
                ${meal.strMeal}
              </h3>
              <p class="text-xs text-slate-400">
                <span class="inline-flex items-center gap-1">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-400/70"></span>
                  ${meal.strCategory || 'Miscellaneous'}
                </span>
              </p>
            </div>
            <button
              class="mt-3 inline-flex items-center justify-center gap-1.5 text-[0.72rem] sm:text-xs
                     text-emerald-300 hover:text-emerald-200 font-medium
                     py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20
                     border border-emerald-500/30 transition-colors">
              View details
              <span class="text-[0.65rem]">↗</span>
            </button>
          </div>
        `;

        li.onclick = () => showDetails(meal);
        recipeList.appendChild(li);
        li.style.animation = `slideUp 0.4s ease-out ${index * 0.04}s both`;
      });

      if (data.meals[0]) {
        showDetails(data.meals[0]);
      }
    } catch (error) {
      loader.classList.add('hidden');
      recipeList.innerHTML = `<p class="text-red-400 text-sm">Error fetching recipes. Please try again.</p>`;
      recipeDetails.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center text-red-400 text-sm">
          <p class="mb-1">Network or API error.</p>
          <p class="text-xs text-slate-500">Check your connection and try again.</p>
        </div>`;
    }
  }

  function showDetails(meal) {
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`] || '';
      if (ing && ing.trim() !== '') {
        ingredients += `
          <li class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400/80"></span>
            <span class="text-slate-100 text-sm">
              ${ing}
              <span class="text-slate-400 text-xs">${measure}</span>
            </span>
          </li>`;
      }
    }

    recipeDetails.innerHTML = `
      <div class="space-y-4 sm:space-y-5">
        <div class="overflow-hidden rounded-2xl relative">
          <img
            src="${meal.strMealThumb}"
            alt="${meal.strMeal}"
            class="w-full h-52 sm:h-56 object-cover rounded-2xl ring-1 ring-slate-800/80
                   transform hover:scale-[1.03] transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>
          <div class="absolute bottom-3 left-3 flex gap-2 text-[0.7rem]">
            <span class="px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-700/80 text-slate-100">
              ${meal.strArea || 'Global'}
            </span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-200">
              ${meal.strCategory || 'Category'}
            </span>
          </div>
        </div>
        <div>
          <h3 class="text-xl sm:text-2xl font-bold mb-1">${meal.strMeal}</h3>
          <p class="text-xs sm:text-sm text-slate-400">
            ${meal.strTags ? '#' + meal.strTags.split(',').join(' #') : 'No tags available'}
          </p>
        </div>
        <div>
          <h4 class="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
            <span>🧂 Ingredients</span>
            <span class="text-[0.65rem] text-slate-400">
              (up to 20 items)
            </span>
          </h4>
          <ul class="space-y-1.5 max-h-40 overflow-y-auto pr-2 text-slate-200 text-sm custom-scroll">
            ${ingredients || '<li class="text-slate-400 text-sm">No ingredient data.</li>'}
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-2 text-sm sm:text-base">👨‍🍳 Instructions</h4>
          <p class="text-slate-300 text-sm sm:text-[0.95rem] leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto pr-1.5 custom-scroll">
            ${meal.strInstructions || 'No instructions available.'}
          </p>
        </div>
        <div class="flex flex-wrap gap-2 pt-1">
          ${meal.strYoutube ? `
            <a
              href="${meal.strYoutube}"
              target="_blank"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                     bg-red-500/15 text-red-300 text-xs sm:text-[0.75rem] border border-red-400/40
                     hover:bg-red-500/25 transition-colors">
              ▶ Watch on YouTube
            </a>
          ` : ''}
          ${meal.strSource ? `
            <a
              href="${meal.strSource}"
              target="_blank"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                     bg-slate-900/80 text-slate-200 text-xs sm:text-[0.75rem] border border-slate-700/80
                     hover:bg-slate-800/90 transition-colors">
              🌐 Original source
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  searchBtn.addEventListener('click', fetchRecipes);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchRecipes();
  });
});
