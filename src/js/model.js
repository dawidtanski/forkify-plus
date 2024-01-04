import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

import 'regenerator-runtime/runtime';
import 'core-js/stable';

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
    numIngredients: recipe.ingredients.reduce(
      (acc, cur) => (acc += cur.quantity),
      0
    ),
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
    // console.log(state.search);
  } catch (err) {
    // Temp error handling
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(state.recipe);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥💥💥💥`);
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

/* FUNCTION TO STORE PAGE RESULTS AND TEST without making server request so often
  Model: called in getSearchResultsPage function and init function
  Controller: in controlSearchResults switch lines of code with commented code in sections 3 and 5 and comment "if (!query) return;"
  */

const persistResults = function () {
  localStorage.setItem(
    'results-page',
    JSON.stringify(state.search.resultsPage)
  );
};

const getStoredResults = function () {
  const storage = localStorage.getItem('results-page');
  // console.log(storage);
  const parsedResults = JSON.parse(storage);
  if (storage) state.search.results = JSON.parse(storage);
};

/////////////////

// const persistStateSearch = function () {
//   localStorage.setItem('state', JSON.stringify(state.search));
// };

// const getStateSearch = function () {
//   const getState = localStorage.getItem('results-page');
//   console.log(getState);
//   const parsedgetStateSearch = JSON.parse(getState);
//   console.log(parsedgetStateSearch);
//   if (storage) state.search = JSON.parse(getState);
// };

/////////

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // newQt = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
  });

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

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    console.log(newRecipe);
    const ingredients = Object.keys(newRecipe)
      .filter(key => key.startsWith('ingredient-type-'))
      .map(key => {
        const ingredientNumber = key.split('-')[2];
        const quantityKey = `ingredient-quantity-${ingredientNumber}`;
        const unitKey = `ingredient-unit-${ingredientNumber}`;

        return {
          quantity: +newRecipe[quantityKey],
          unit: newRecipe[unitKey],
          description: newRecipe[key],
        };
      });

    console.log('Ingredients:', ingredients);

    /*const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient')
      */
    /*
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());

        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        // if (ingArr.length !== 3)
        //   throw new Error(
        //     'Wrong ingredient format! Please use the correct format :)'
        //   );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });
*/
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    console.log(recipe);
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
