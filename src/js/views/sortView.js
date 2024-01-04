import View from './view.js';
import icons from 'url:../../img/icons.svg';

class SortView extends View {
  _parentElement = document.querySelector('.sort-btn');
  _errorMessage = 'error rendering buttons';

  _generateMarkup(results) {
    return `
      <button class="btn-sort btn--sortByIng">
        <span>Sort by Ingredients </span>
        <svg class="sort-icon hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>

      <button class="btn-sort btn--sortByDur">
        <span>Sort by Duration</span>
        <svg class="sort-icon hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
    `;
  }

  addHandlerSort(handler) {
    const listenerFunc = function (e) {
      e.preventDefault();
      const sortBtn = e.target.closest('.btn-sort');

      if (!sortBtn) return;

      sortBtn.childNodes[3].classList.remove('hidden'); // hide sort-icon
      let typeSort = sortBtn.classList.contains('desc') ? 'desc' : 'asc';

      if (sortBtn.classList.contains('btn--sortByIng')) {
        handler(this._sortBy('numIngredients', typeSort)); // sort by ingredients
        sortBtn.classList.add('sort-active'); // apply styles to active button
        sortBtn.nextElementSibling.classList.remove('sort-active');
      } else if (sortBtn.classList.contains('btn--sortByDur')) {
        handler(this._sortBy('cookingTime', typeSort)); // sort by cooking time
        sortBtn.classList.add('sort-active');
        sortBtn.previousElementSibling.classList.remove('sort-active');
      }

      sortBtn.classList.toggle('desc');
    };

    this._parentElement.addEventListener('click', listenerFunc.bind(this)); // bind "this" because "handler" is not found in the scope (_parentElement's scope). Try without it to test
  }

  _sortBy(type, order) {
    let data = this._data;
    const compareFunc = function (a, b) {
      if (order == 'asc') {
        return a[type] - b[type];
      } else if (order == 'desc') {
        return b[type] - a[type];
      }
    };
    data.sort(compareFunc);
    return data;
  }
}

export default new SortView();
