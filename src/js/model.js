import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON } from './helpers.js';
// import { sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';
import { asinh } from 'core-js/./es/number';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPage: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  console.log(data);
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    numIng: recipe.ingredients.reduce((acc, cur) => (acc += cur.quantity), 0),
    ...(recipe.key && { key: recipe.key }),
    // If key doesn' exist nothing will happens, but if the key exist the object - key will be created and then will be spreaded so finally we have property key: recipe key
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
  } catch (err) {
    //Temporary error handling
    console.error(`${err} 💥💥💢💢`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    // state.search.results = await Promise.all(
    //   data.data.recipes.map(rec => createResultsObj(rec))
    // );
    // for (const rec of data.data.recipes) {
    //   const result = await createResultsObj(rec);
    //   state.search.results.push(result);
    // }

    state.search.results = data.data.recipes.map(function (rec) {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
    console.log('All search results', state.search.results);
    // console.log(data);
    // console.log(query);
  } catch (err) {
    console.log(`${err} 💥💥💥💥`);
    throw err;
  }
};

export const getSearchResultsPage = async function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9

  const newResults = state.search.results
    .slice(start, end)
    .map(async function (rec) {
      try {
        const data = await AJAX(`${API_URL}/${rec.id}?key=${KEY}`);
        const { recipe } = data.data;

        rec.cookingTime = recipe.cooking_time;
        rec.numIngredients = recipe.ingredients.length;

        return rec;
      } catch (err) {
        console.error(`${err} 💥💥💢💢`);
        throw err;
      }
    });

  const results = await Promise.all(newResults);
  console.log('Search results per page:', results);
  state.search.resultsPage = results;
  persistResults();
  return results;
};

const persistResults = function () {
  localStorage.setItem(
    'results-page',
    JSON.stringify(state.search.resultsPage)
  );
};

const getStoredResults = function () {
  const storage = localStorage.getItem('results-page');
  if (storage) state.search.results = JSON.parse(storage);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  // newQt = oldQt * newServings / oldServings
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

// It's common that if we add data we want entire data, but if we want to delete something we need only id
export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  getStoredResults();
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();
console.log(state.bookmarks, state.search.results);

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)'
          );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
