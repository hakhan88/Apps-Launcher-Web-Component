class AppSelectorClass extends HTMLElement {

  // need this to return the dataList when using the web component outside the angular environment to trigger
  // the attributeChangedCallback life cycle
  static get observedAttributes() {
    return ['data'];
  }

  constructor(
    appSelector = null,
    appLauncher = null,
    button = null,
    template = null,
    clickMoreShowDisplay = null,
    secondSet = null,
    scroll = false,
    dataListStore = null,
    markup = null,
    outerShell = null,
  ) {
    super();
    this.attachShadow({
      mode: 'open'
    });
  }

  /**
   * native web component call back that is used to attach shadow DOM and creating template using the slot tags, which is
   * used to inject HTML inside the slot tags
   */
  connectedCallback() {
    // creating template rather than relying on the projects
    this.template = document.createElement('template');
    this.template.innerHTML =
      `
        <div>
          <slot name="outer-shell">
            <div>
              <slot name="new-slot"></slot>
            </div>
          </slot>
        </div>
      `;

    // append shadow root
    this.shadowRoot
      .appendChild(
        this.template.content.cloneNode(true)
      );

    this.setAllEventListeners();
  }

  // in case we are using the web component outside angular environment, we need to use attributes to pass the data
  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === 'data') {
      this.dataList = JSON.parse(newVal);
    }
  }

  /**
   * generate the other html that is used to attach above the drop down list
   * if only one applciation then will show the image insteadd of showing nine dots thumbnail
   */
  generateOuterMarkup() {
    if (this.dataListStore.length > 1) {
      this.outerShell =
        `
        <div slot="outer-shell">
          <div class="app-launcher-container">
            <div class="launcher">
              <div class="button button${this.unique}">
                  <svg id="icn_nine_dots" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="20px" height="20px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve"><rect y="445.091" width="166.909" height="166.909"/><rect x="222.545" y="222.545" width="166.909" height="166.909"/><rect y="222.545" width="166.909" height="166.909"/><rect x="222.545" width="166.909" height="166.909"/><rect width="166.909" height="166.909"/><rect x="445.091" y="445.091" width="166.909" height="166.909"/><rect x="222.545" y="445.091" width="166.909" height="166.909"/><rect x="445.091" width="166.909" height="166.909"/><rect x="445.091" y="222.545" width="166.909" height="166.909"/></svg>
              </div>
              <div class="app-launcher app-launcher${this.unique}"
                  style="display: none;">
                <div class="apps apps${this.unique}">
                
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      const singleApp = this.dataListStore[0];
      this.outerShell =
        `
          <div slot="outer-shell">
            <div class="app-launcher-container">
              <div class="launcher">
                <a href="${singleApp.url}"
                    target="_blank">
                  <img class="appLauncherImages" title="${singleApp.nm}" id="${singleApp.clientId + this.unique}">
                </a>
              </div>
            </div>
          </div>
        `;
    }
  }

  /**
   * appends the out shell, style tags (which will not bubble outside the web component), and if more than one
   * application then will append the ul list and drop down
   */
  appendTemplate() {
    const style = document.createElement('style');
    style.textContent = AppSelectorClassStyle;

    const ulListMarkup = new DOMParser().parseFromString(this.markup, 'text/html').body.firstChild;
    const outerShell = new DOMParser().parseFromString(this.outerShell, 'text/html').body.firstChild;
    this.appendChild(outerShell);

    // keep the style on the webcomponet rather then defining it over any places where the component is used
    this.appendChild(style);
    if (this.dataListStore.length > 1) {
      this.querySelector('.apps' + this.unique).appendChild(ulListMarkup);
    }

  }

  /**
   * generate the template of the list that needs to be appended to the app launcher when the 
   */
  generateTemplate() {

    this.markup = `
      <ul class="first-set"
                  slot="new-slot">
      ${
      this.dataListStore ?
        this.dataListStore.map((individualData, i) =>
          `
            ${i <= 8 ?
            `
                <a href="${individualData.url}"
                    target="_blank">
                  <li>
                    <img class="appLauncherImages" id="${individualData.clientId + this.unique}">
                  </li>
                </a>
              ` : ``
          }
            ${i === 8 ?
            `
                <button class="clickMoreShowDisplay clickMoreShowDisplay${this.unique}">More</button>
              ` : ``
          }
            ${i > 8 ?
            `
                <a href="${individualData.url}"
                     target="_blank">
                    <li style="display: none;"
                        class="second-set second-set${this.unique}">
                      <img class="appLauncherImages" id="${individualData.clientId + this.unique}">
                    </li>
                  </a>
              ` : ``
          }
          `).join('')
        :
        ``
      }
      </ul>
    `;

  }

  /**
   * generate and append template only when the data arrives
   */
  generateAndAppendTemplate() {
    this.generateOuterMarkup();

    this.generateTemplate();
    this.appendTemplate();
  }

  /**
   * sets the event listeners for all the scroll animations, click event for displaying and hiding the drop down
   * application list and click on show more button if it exists
   */
  setAllEventListeners() {

    this.appSelector = document.querySelector('.apps' + this.unique);
    this.appLauncher = document.querySelector('.app-launcher' + this.unique);
    this.button = document.querySelector('.button' + this.unique);
    this.clickMoreShowDisplay = document.querySelector('.clickMoreShowDisplay' + this.unique);
    this.secondSet = document.querySelectorAll('.second-set' + this.unique);

    if (!this.appSelector) return;

    if (this.button) {
      // Click event handler to toggle dropdown
      this.button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (this.appLauncher.style.display === "none") {
          this.appLauncher.style.display = "block";
        } else {
          this.appLauncher.style.display = "none";
        }
      });
    }

    //Hide the launcher if visible
    document.addEventListener('click', () => { this.appLauncher.style.display = "none"; });

    // Prevent hiding on click inside app launcher
    this.appLauncher.addEventListener('click', (event) => { event.stopPropagation(); });

    // Mousewheel event handler to detect whether user has scrolled over the container
    this.appSelector.addEventListener('mousewheel', (e) => { });

    // Scroll event to detect that scrollbar reached top of the container
    this.appSelector.addEventListener('scroll', function () {
      var pos = this.scrollTop;
      const second = document.querySelectorAll('.second-set');
      if (pos === 0) {
        this.scroll = false;
        this.classList.remove('overflow');
        second.forEach((ele) => {
          ele.style.display = "none";
        });
      }
    });

    if (this.clickMoreShowDisplay) {
      this.clickMoreShowDisplay.addEventListener('click', () => {
        if (this.secondSet) {
          this.secondSet.forEach((ele) => {
            ele.style.display = "block";
          });
        }
        this.appSelector.animate({
          scrollTop: this.appSelector.scrollHeight,
        });
        this.appSelector.style.height = 296;
        this.appSelector.classList.add('overflow');
      });
    }

    // Resize event handler to maintain the max-height of the app launcher
    window.addEventListener('resize', () => { });
  }

  /**
   * the images needs too be attached few seconds after the blob generation is done
   */
  attachImages() {
    this.dataListStore.forEach(cli => {
      if (document.querySelector('#' + cli.clientId + this.unique + '')) {
        setTimeout(() => {
          document.querySelector('#' + cli.clientId + this.unique + '').src = cli.imgUrl;
        }, 1200);
      }
    });
  }


  /**
   * attach unique to be able to differenciate app launcher just in case if exists more that one on any
   * specific page
   */
  get unique() {
    return this.getAttribute('unique');
  }

  set unique(newValue) {
    this.setAttribute('unique', newValue);
  }

  /**
   * inputs the data list from the parent component using ap launcher
   */
  get dataList() {
    return this.getAttribute('dataList');
  }

  set dataList(newValue) {
    if (newValue.length > 0) {
      this.dataListStore = newValue;
      this.generateAndAppendTemplate();
      this.setAllEventListeners();
      this.attachImages();
    }
  }

  // remove all bindings when move away from the component
  disconnectedCallback() {
    this.removeEventListener('click', this.clickMoreShowDisplay);
    this.removeEventListener('scroll', this.appSelector);
    this.removeEventListener('click', document);
    this.removeEventListener('click', this.button);
  }
}

module.exports = {
  CustomElements: customElements.define('nt-app-launcher-apps', AppSelectorClass)
}

AppSelectorClassStyle = `
  .app-launcher-container { width: 50px;	margin: 0; }

  header {	text-align:center; }

  header h1 {	font-size: 2em; line-height: 1.3; margin: 0; font-weight: 300; margin: 20px; }

  .app-launcher { position: relative; left: -153px; width: 320px; z-index: 99; }

  .app-launcher::before { content: ''; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 10px solid white; position: absolute; top: -9px; left: 50%; margin-left: -5px; z-index: 1; }

  .apps { position: relative; border: 1px solid #ccc; border-color: rgba(0,0,0,.2); box-shadow: 0 2px 10px rgba(0,0,0,.2); -webkit-transition: height .2s ease-in-out; transition: height .2s ease-in-out; overflow-y: auto; overflow-x: hidden; width: 320px; max-height: 400px; margin-bottom: 30px; }

  .launcher .button { cursor: pointer; width: 32px; margin: 0 0; height: 32px; }

  .launcher { height: 30px; }

  .hide { display: none; }

  .apps ul { background: #fff; margin: 0; padding: 28px; width: 264px; overflow: hidden; list-style: none; }

  .apps ul li { float: left; height: 64px; width: 88px; color: black; padding: 18px 0; text-align: center; }

  ::-webkit-scrollbar-thumb { background-clip: padding-box; background-color: rgba(0,0,0,.3); border: 5px solid transparent; border-radius: 10px; min-height: 20px;	min-width: 20px; height: 5px; width: 5px; }

  .apps.overflow .clickMoreShowDisplay { border-bottom: 1px solid #ebebeb; left: 28px;	width: 264px;	cursor: default; outline: none; display: none; }

  .apps .clickMoreShowDisplay { line-height: 40px; text-align: center; display: block; width: 270px; background: #f5f5f5; cursor: pointer; height: 40px; overflow: hidden; position: relative; text-decoration: none; color: #282828; }

  ::-webkit-scrollbar { height: 15px; width: 15px; background: white; }

  ::-webkit-scrollbar-button { height: 0; width: 0; }

  .appLauncherImages { height: 50px; width: 60px; }
`;
