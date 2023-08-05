'use strict';

// factory function
const Data = (initValue) => {
  let _value = initValue;

  const get = () => _value;
  const set = (v) => (_value = v);

  return {
    get,
    set,
  };
};

// App's state
const Info = (() => {
  //////////// api key \\\\\\\\\\
  const api = Data('fad6a35f4297467f9ca111534232707');

  //////////// Fahrenheit or Celsius \\\\\\\\\\
  let _unit = 'c';

  const unit = {
    get() {
      return _unit;
    },
    toggle() {
      _unit = _unit === 'c' ? 'f' : 'c';
    },
  };

  ////////// current state object \\\\\\\\\\
  let _current = {
    name: '',
  };

  const current = {
    get() {
      return _current;
    },
    set(v) {
      _current = v;
    },
  };

  return {
    api, // api_key isn't needed to make things less complicated
    unit,
    current,
  };
})();

// Update UI
const Display = (() => {
  const units = document.querySelectorAll('[data-unit]');

  const ui = () => {
    // display ui base on current obj in Info
    const obj = Info.current.get();

    for (const key in obj) {
      const element = document.querySelector(`[data-${key}]`);
      if (key === 'icon') {
        element.src = obj.icon;
        continue;
      }
      element.textContent = obj[key];
    }
  };

  const switchUnit = () => {
    // display units base on current unit in Info
    const current = Info.unit.get();
    units.forEach((element) => {
      const eleUnit = element.dataset.unit;
      if (current === eleUnit) {
        element.style.display = 'block';
        return;
      }
      element.style.display = 'none';
    });
  };
  return {
    ui,
    switchUnit,
  };
})();

// Call to fetch data
const Request = (() => {
  const weather = (city) => {
    // ignore if user search the same input
    if (Info.current.get().name === city) return;
    fetch(`http://api.weatherapi.com/v1/current.json?key=fad6a35f4297467f9ca111534232707&q=${city}`, { mode: 'cors' })
      .then((response) => {
        // check if bad request
        if (response.status !== 200) {
          throw new Error('Bad Request');
        }
        return response.json();
      })
      .then((data) => {
        // extract data
        const { name, country, localtime_epoch } = data.location;

        // Ignore to update UI if user search the same city
        if (Info.current.get().name === name) throw new Error('Same city');

        let { text, icon } = data.current.condition;

        const { temp_c, temp_f, wind_kph, wind_mph, wind_degree, humidity, feelslike_c, feelslike_f, uv } = data.current;

        // exchange local epoch time
        const now = new Date(localtime_epoch * 1000).toLocaleString().split(', ');
        const [date, time] = [...now];

        // exchange icon link to local link
        // from '//cdn.weatherapi.com/weather/64x64/day/116.png'
        // to './src/img/weather/64x64/day/116.png'
        icon = './src/img' + icon.split('api.com')[1];

        const obj = {
          uv,
          text,
          icon,
          name,
          country,
          date,
          time,
          temp_c,
          temp_f,
          wind_kph,
          wind_mph,
          humidity,
          wind_degree,
          feelslike_c,
          feelslike_f,
        };

        Info.current.set(obj);
        Display.ui();
        console.table(obj);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return {
    weather,
  };
})();

// Event Listeners
(() => {
  const form = document.querySelector('#header_search > form');
  const input = document.querySelector('#search_city');
  const themeBtn = document.querySelector('.unit .change_theme');
  const unitBtn = document.querySelector('.unit .change_unit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    Request.weather(input.value);
    input.value = '';
  });

  const toggleOnOff = (element) => {
    const text = element.textContent;
    if (text === ' toggle_on ') {
      element.textContent = ' toggle_off ';
    } else {
      element.textContent = ' toggle_on ';
    }
  };

  // leave this feature for later
  themeBtn.addEventListener('click', (e) => {
    toggleOnOff(e.target);
  });

  unitBtn.addEventListener('click', (e) => {
    toggleOnOff(e.target);
    Info.unit.toggle();
    Display.switchUnit();
  });

  window.addEventListener('DOMContentLoaded', (e) => {
    Request.weather('Ho Chi Minh');
  });
})();
