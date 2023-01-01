// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import countries from './data/mock.js';
import { showNotification } from './modules/showNotification.js';
import axios from 'axios';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='currency-converter'>
    <h2>Currency Converter</h2>
    <div class='content'>
      <form data-form=''>
        <label>
          <span>Enter Amount</span>
          <input type='number' value='1' step='1' min='1' name='amount'>
        </label>

        <div class='directions'>
          <label>
            <span class='label'>From</span>
            <div class='select'>
              <img src='https://flagcdn.com/48x36/us.png' alt='flag'>
              <select data-select='from' name='from'>
                ${countries.map(({ name }) => `${name === 'USD' ? `<option value='${name}' selected>${name}</option>` : `<option value='${name}'>${name}</option>`}`).join('')}
              </select>
            </div>
          </label>
          <div class='icon' data-switch=''>${feather.icons.repeat.toSvg()}</div>
          <label>
            <span class='label'>To</span>
            <div class='select'>
              <img src='https://flagcdn.com/48x36/ru.png' alt='flag'>
              <select data-select='to' name='to'>
                ${countries.map(({ name }) => `${name === 'RUB' ? `<option value='${name}' selected>${name}</option>` : `<option value='${name}'>${name}</option>`}`).join('')}
              </select>
            </div>
          </label>
        </div>

        <div class='exchange' data-exchange=''>Getting exchange rate...</div>
        <button type='submit'>Get Exchange Rate</button>
      </form>
</div>
</div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      form: document.querySelector('[data-form]'),
      selects: document.querySelectorAll('[data-select]'),
      exchange: document.querySelector('[data-exchange]'),
      switch: document.querySelector('[data-switch]'),
    };

    this.getExchange();
    this.DOM.form.addEventListener('submit', this.onSubmit);
    this.DOM.selects.forEach(select => select.addEventListener('change', this.onChange));
    this.DOM.switch.addEventListener('click', this.onSwitch);
  }

  /**
   * @function onChange - Select change event handler
   * @param target
   */
  onChange = ({ target }) => {
    const flagImg = target.previousElementSibling;
    const flagAbbr = countries.find(({ name, value }) => name === target.value).value.toLowerCase();
    flagImg.src = `https://flagcdn.com/48x36/${flagAbbr}.png`;
  };

  /**
   * @function onSubmit - Form submit handler
   * @param event
   */
  onSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const { amount, to, from } = Object.fromEntries(new FormData(form).entries());

    if (amount.trim().length === 0 || !to || !from) {
      showNotification('warning', 'Please fill the fields.');
      return;
    }
    this.DOM.exchange.innerHTML = 'Getting exchange rate...';
    this.fetchData(amount, from, to);
  };

  /**
   * @function onSwitch - Switch currencies
   */
  onSwitch = () => {
    const amount = this.DOM.form.querySelector('[type="number"]').value;
    const from = this.DOM.selects[0];
    const to = this.DOM.selects[1];
    const tmpCode = from.value;
    const tmpSrc = from.previousElementSibling.src;

    if (amount.trim().length === 0) {
      showNotification('warning', 'Please fill the fields.');
      return;
    }

    from.value = to.value;
    to.value = tmpCode;
    from.previousElementSibling.src = to.previousElementSibling.src;
    to.previousElementSibling.src = tmpSrc;

    this.fetchData(amount, from.value, to.value);
  };

  /**
   * @function fetchData - Fetch data from API
   * @param amount
   * @param from
   * @param to
   * @returns {Promise<void>}
   */
  fetchData = async (amount, from, to) => {
    try {
      const {
        data: {
          result,
          date,
          success,
          info: { rate },
        },
      } = await axios.get(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);

      if (!success) {
        showNotification('danger', 'Something went wrong, open dev console.');
        return;
      }

      this.DOM.exchange.innerHTML = `
      <table>
        <tr>
          <td><span>Date</span></td>
          <td>${new Date(date).toLocaleString()}</td>
        </tr>
        <tr>
          <td><span>Rate</span></td>
          <td><span>1</span> ${from} = <span>${rate.toFixed(2)}</span> ${to}</td>
        </tr>
        <tr>
          <td><span>Exchange</span></td>
          <td><span>${amount}</span> ${from} = <span>${result.toFixed(2)}</span> ${to}</td>
        </tr>
      </table>
      `;
    } catch (e) {
      console.log(e);
      showNotification('danger', 'Something went wrong, open dev console.');
    }
  };

  /**
   * @function getExchange - Get exchange by default
   */
  getExchange = () => {
    const amount = this.DOM.form.querySelector('[type="number"]').value;
    const from = this.DOM.selects[0];
    const to = this.DOM.selects[1];
    this.fetchData(amount, from.value, to.value);
  };
}

// ⚡️Class instance
new App();
