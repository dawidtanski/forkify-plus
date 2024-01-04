import View from './view.js';
import icons from 'url:../../img/icons.svg'; // Parcel 2

class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _message = 'Recipe was successfully uploaded :)';

  ingredientCounter = 1;

  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');
  _btnAddIng = document.querySelector('.btn_add_ing');

  constructor() {
    super();

    // this._parentElement = document.querySelector('.upload');
    // this._message = 'Recipe was successfully uploaded :)';
    // this.ingredientCounter = 1;

    // this._window = document.querySelector('.add-recipe-window');
    // this._overlay = document.querySelector('.overlay');
    // this._btnOpen = document.querySelector('.nav__btn--add-recipe');
    // this._btnClose = document.querySelector('.btn--close-modal');
    // this._btnAddIng = document.querySelector('.btn_add_ing');

    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
    this._addHandlerAddIngredient();
  }

  createInputElement(type, name, placeholder) {
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.placeholder = placeholder;
    input.required = true;

    return input;
  }

  addIngredient() {
    // console.log(`Ingredient was added succesfully!`);
    const container = document.querySelector('.upload__column');
    const label = document.createElement('label');
    label.textContent = `Ingredient ${this.ingredientCounter}`;
    const ingredientDiv = document.createElement('div');

    const quantityInput = this.createInputElement(
      'text',
      `ingredient-quantity-${this.ingredientCounter}`,
      'Quantity'
    );
    const unitInput = this.createInputElement(
      'text',
      `ingredient-unit-${this.ingredientCounter}`,
      'Unit'
    );
    const typeInput = this.createInputElement(
      'text',
      `ingredient-type-${this.ingredientCounter}`,
      'Type'
    );

    ingredientDiv.appendChild(label);
    ingredientDiv.appendChild(quantityInput);
    ingredientDiv.appendChild(unitInput);
    ingredientDiv.appendChild(typeInput);

    container.appendChild(ingredientDiv);

    this.ingredientCounter++;
  }

  _addHandlerAddIngredient() {
    this._btnAddIng.addEventListener('click', this.addIngredient.bind(this));
  }

  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
    console.log(`Button clicked!`);

    // if (!this._overlay.classList.contains('hidden')) {
    //   this._message = '';
    //   this._clear();
    // }
  }
  _addHandlerShowWindow() {
    // const btnOpen = document.querySelector('.nav__btn--add-recipe');
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  // resetForm() {
  //   const form = document.querySelector('.upload');
  //   form.reset();
  // }

  addHandlerUpload(handler) {
    // console.log('Handler added');
    this._parentElement.addEventListener('submit', function (e) {
      // console.log('Wyślij');
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);
      // const formData = new FormData(this);
      // const data = {};

      // console.log('Form Data:', formData);

      // // Przetwarzanie danych o przepisie
      // formData.forEach((value, name) => {
      //   data[name] = value;
      // });

      // // Przetwarzanie danych o składnikach
      // const ingredients = [];
      // for (let i = 1; i <= 6; i++) {
      //   const quantity = formData.get(`ingredient-unit-${i}-quantity`);
      //   const unit = formData.get(`ingredient-unit-${i}-unit`);
      //   const type = formData.get(`ingredient-unit-${i}-type`);

      //   if (quantity && unit && type) {
      //     ingredients.push({ quantity, unit, type });
      //   }
      // }

      // data.ingredients = ingredients;
      console.log('Before submitting form - Data:', data);
      handler(data);
      console.log('After submitting form - Data:', data);
      toggleWindow();
    });
  }

  _generateMarkup() {}
}

export default new AddRecipeView();
