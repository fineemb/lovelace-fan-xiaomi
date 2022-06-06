
console.info("%c Xiaomi Fan Card \n%c  Version  1.3.5 ", "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");
import 'https://unpkg.com/@material/mwc-slider@0.18.0/mwc-slider.js?module'
const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;
const includeDomains = ["fan"];

export class FanXiaomiCard extends LitElement {
  setConfig(config) {
    this.config = config;
  }
  constructor() {
    super();
    this._timer1 = null;
    this._timer2 = null;
  }
  static get properties() {
      return {
          hass: {},
          config: {},
          over:false,
          x0:false,
          y0:false,
          speedvalue:0
      };
  }
  static getConfigElement() {
    return document.createElement("fan-xiaomi-card-editor");
  }
  static getStubConfig() {
    return {name: 'Fan',
            entity: '',
            aspect_ratio: '1',
            background_color:''}
  }
  render() {
    let fans=[];
    for(var i=1;i<73;i++){
      fans.push(i)
    }
    let fan1s=[];
    for(var i=1;i<73;i+=2){
      fan1s.push(i)
    }
    const state = this.hass.states[this.config.entity];
    const attrs = state.attributes;
    let nowspeed = attrs['natural_speed'] || attrs['direct_speed'] || attrs['raw_speed']
    return html`
    <div id="aspect-ratio" 
      style="width:${100*this.config.aspect_ratio||100}%" 
      class="${state.state=='unavailable'||state.state.state=='unavailable'?'offline':''}" 
      @mouseout="${function(){this.over=false}}" 
      @mouseover="${function(){this.over=true}}" 
      @mousemove="${this.onMouseMove}"
      @touchmove="${this.onMouseMove}"
      @mouseup="${this.onMouseUp}"
      @touchend="${this.onMouseUp}">
      <ha-card id="fan" class="${state.state=='on'||state.state.state=='on'?'active':''}" style="background:${this.config.background_color||''}">
        <div id="container">
          <div class="fanbox ${state.state=='on'||state.state.state=='on'?'active':''} ${attrs['oscillate']?"oscillate"+attrs['angle']:""}">
            <div class="blades" style="animation-duration:${5-nowspeed/100*5+1}s">
              <div class="b1 ang1"></div>
              <div class="b2 ang25"></div>
              <div class="b3 ang49"></div>
            </div>
            ${fans.map(i => html`<div class="fan ang${i}"></div>`)}
            ${fan1s.map(i => html`<div class="fan1 ang${i}"></div>`)}
            <div class="c2"></div>
            <div class="c3">
                <ha-icon id="power" icon="${state.state=='on'||state.state.state=='on'?(attrs['natural_speed'] || attrs['mode']==='nature'?'mdi:leaf':'mdi:weather-windy'):'mdi:power'}" class="c_icon state show" role="button" tabindex="0" aria-disabled="false" .cmd="${'toggle'}" @click=${this._action}></ha-icon>
            </div>
            <div class="c1">
              <div class="wrapper rightc ${attrs['battery_charge']!="complete"?"battery_charge":""} ${attrs['battery']<20?"red":""}">
                <div class="circle rightcircle" style="transform:${attrs['battery']?attrs['battery']<50?"rotate(-135deg)":"rotate("+(attrs['battery']/(100/360)-180-135)+"deg)":""}"></div>
              </div>
              <div class="wrapper leftc ${attrs['battery_charge']!="complete"?"battery_charge":""} ${attrs['battery']<20?"red":""}">
                <div class="circle leftcircle" style="transform:${attrs['battery']?attrs['battery']<50?"rotate("+(attrs['battery']/(100/360)-135)+"deg)":"rotate(45deg)":""}"></div>
              </div>
            </div>
            <svg id="speedsvg" class="${this.over?'show':'hidden'}" width="100%" height="100%" viewBox="0 0 400 400"  @mousedown="${this.onMouseDown}" @touchstart="${this.onMouseDown}">
              <circle 
                id="speed" 
                cx="200" 
                cy="200" 
                r="170" 
                fill="none" 
                class="grab" 
                style="stroke: var(--paper-item-icon-active-color); fill: none; stroke-width: 8; stroke-dasharray: 1068.14; transform: rotate(90deg); transform-origin: 50% 50%; stroke-dashoffset: ${this.speedvalue?(1-this.speedvalue)* Math.PI*340:(1-nowspeed/100) * Math.PI*340};"></circle>
            </svg>
          </div>
        </div>

        <div class="chevron left ${this.over?'show':'hidden'}">
          <mwc-icon-button class="c_icon" role="button" tabindex="0" aria-disabled="false" .cmd="${'set_direction_left'}" @click=${this._action}>
            <ha-icon icon="mdi:chevron-left"></ha-icon>
          </mwc-icon-button>
        </div>
        <div class="chevron right ${this.over?'show':'hidden'}">
          <mwc-icon-button class="c_icon" role="button" tabindex="0" aria-disabled="false" .cmd="${'set_direction_right'}" @click=${this._action}>
            <ha-icon icon="mdi:chevron-right"></ha-icon>
          </mwc-icon-button>
        </div>
        <div class="prop">
          <mwc-icon-button id="more" class="c_icon" role="button" tabindex="0" aria-disabled="false" .cmd="${'more'}" @click=${this._action}>
            <ha-icon icon="mdi:dots-vertical"></ha-icon>
          </mwc-icon-button>
        </div>
        
        <div id="buttons" class="${this.over?'show':'hidden'}" style="background:${this.config.background_color||'var(--card-background-color)'}">
          <mwc-icon-button id="lock" class="c_icon ${attrs['child_lock']?"active":""}" role="button" tabindex="0" aria-disabled="false" .cmd="${'lock'}" @click=${this._action}>
            <ha-icon icon="hass:lock"></ha-icon>
          </mwc-icon-button>
          <mwc-icon-button class="c_icon ${attrs['delay_off_countdown']?"active":""}" .cmd="${'delay'}" @click=${this._action}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22A9,9 0 0,0 21,13A9,9 0 0,0 12,4M12.5,8V8M7.88,3.39L6.6,1.86L2,5.71L3.29,7.24L7.88,3.39M22,5.72L17.4,1.86L16.11,3.39L20.71,7.25L22,5.72Z"></path>
              <text  x="12" y="13">
                <tspan style="stroke: ${this.config.background_color||'var(--card-background-color)'}; stroke-width: 3;">${attrs['model']==='dmaker.fan.p5'?attrs['delay_off_countdown']:Math.ceil(attrs['delay_off_countdown']/60)}</tspan>
              </text>
              <text  x="12" y="13">
                <tspan>${attrs['model']==='dmaker.fan.p5'?attrs['delay_off_countdown']:Math.ceil(attrs['delay_off_countdown']/60)}</tspan>
              </text>
            </svg>
          </mwc-icon-button>

          <mwc-icon-button class="c_icon ${attrs['oscillate']?"active":""}" .cmd="${'oscillate'}" @click=${this._action}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M4,6l1,-6l5,6.5z"></path>
              <path class="oc" d="M3,7A 10 10, 0, 1, 0, 5.5 4," fill="none" style="stroke-width: 2"></path>
              <text  x="12" y="12">
                <tspan style="stroke: ${this.config.background_color||'var(--card-background-color)'}; stroke-width: 3;">${attrs['oscillate']?attrs['angle']==118?"120":attrs['angle']:"0"}</tspan>
              </text>
              <text  x="12" y="12">
                <tspan>${attrs['oscillate']?attrs['angle']==118?"120":attrs['angle']:"0"}</tspan>
              </text>
            </svg>
          </mwc-icon-button>
          <mwc-icon-button id="bnatural" class="c_icon ${attrs['natural_speed']?"active":attrs['mode']==='nature'?"active":""}" role="button" tabindex="0" aria-disabled="false" .cmd="${'natural_speed'}" @click=${this._action}>
            <ha-icon icon="mdi:leaf"></ha-icon>
          </mwc-icon-button>
          <mwc-icon-button id="buzzer" class="c_icon ${attrs['buzzer']?"active":""}" role="button" tabindex="0" aria-disabled="false" .cmd="${'buzzer'}" @click=${this._action}>
            <ha-icon icon="mdi:surround-sound"></ha-icon>
          </mwc-icon-button>
        </div>
        <mwc-slider
          id="angleslider" 
          class="hidden" 
          pin 
          markers 
          max="140" 
          value="${attrs['oscillate']?attrs['angle']==118?"120":attrs['angle']:"0"}" 
          step="30" 
          style="background:${this.config.background_color||'var(--card-background-color)'}" 
          @mousedown=${this._clickSlider}
          @change=${this._changAngle}
        ></mwc-slider>
        <mwc-slider
          id="delayslider" 
          class="hidden" 
          pin 
          markers 
          max="480" 
          value="${attrs['model']==='dmaker.fan.p5'?attrs['delay_off_countdown']:Math.ceil(attrs['delay_off_countdown']/60)}" 
          step="60" 
          style="background:${this.config.background_color||'var(--card-background-color)'}" 
          @mousedown=${this._clickSlider}
          @change=${this._changDelay}
        ></mwc-slider>
        <div class="header" style="font-size: 9px;" class="${this.over?'hidden':'show'}">   
            <div class="name">
              <span class="ellipsis show" style="">${this.config.name}</span>
            </div>
        </div>
      </ha-card>
    </div>
    `
  }
  static get styles() {
    return css `
    #aspect-ratio {position: relative;}
    #aspect-ratio::before {content: "";display: block;padding-bottom: 100%;}
    #aspect-ratio>:first-child {position: absolute;top: 0;left: 0;height: 100%;width: 100%; overflow: hidden;}
    #container{height: 100%;width: 100%;display: flex;overflow: hidden;}
    #buttons{position: absolute;bottom: 0;justify-content:center;width: calc( 100% - 20px );margin: 0 10px;}
    #buttons>*{position: relative;}
    #buttons.show{display: flex;}
    mwc-icon-button ha-icon{padding-bottom: 8px;}
    #buttons ha-icon-button ,#buttons mwc-icon-button{--mdc-icon-button-size: 32px; }
    #buttons tspan{text-anchor: middle;font-family: Helvetica, sans-serif;alignment-baseline: central;dominant-baseline: central;font-size: 10px;}
    #angleslider,#delayslider{position: absolute;bottom: 0;width: calc( 100% - 20px );margin: 0 10px;z-index: 25;}
    #speedsvg {position: absolute;bottom: 0;width: calc( 100% - 20px );margin: 0 10px;}

    .c_icon {position: absolute;cursor: pointer;top: 0;right: 0;z-index: 25;}
    .c_icon.active{color:var(--paper-item-icon-active-color);fill:var(--paper-item-icon-active-color);}
    .c_icon .oc{stroke:var(--primary-text-color)}
    .c_icon.active .oc{stroke:var(--paper-item-icon-active-color);}

    .offline{opacity:0.5}
    .ang1 {transform: rotate(0deg)}.ang2 {transform: rotate(5deg)}.ang3 {transform: rotate(10deg)}.ang4 {transform: rotate(15deg)}.ang5 {transform: rotate(20deg)}.ang6 {transform: rotate(25deg)}.ang7 {transform: rotate(30deg)}.ang8 {transform: rotate(35deg)}.ang9 {transform: rotate(40deg)}.ang10 {transform: rotate(45deg)}.ang11 {transform: rotate(50deg)}.ang12 {transform: rotate(55deg)}.ang13 {transform: rotate(60deg)}.ang14 {transform: rotate(65deg)}.ang15 {transform: rotate(70deg)}.ang16 {transform: rotate(75deg)}.ang17 {transform: rotate(80deg)}.ang18 {transform: rotate(85deg)}.ang19 {transform: rotate(90deg)}.ang20 {transform: rotate(95deg)}.ang21 {transform: rotate(100deg)}.ang22 {transform: rotate(105deg)}.ang23 {transform: rotate(110deg)}.ang24 {transform: rotate(115deg)}.ang25 {transform: rotate(120deg)}.ang26 {transform: rotate(125deg)}.ang27 {transform: rotate(130deg)}.ang28 {transform: rotate(135deg)}.ang29 {transform: rotate(140deg)}.ang30 {transform: rotate(145deg)}.ang31 {transform: rotate(150deg)}.ang32 {transform: rotate(155deg)}.ang33 {transform: rotate(160deg)}.ang34 {transform: rotate(165deg)}.ang35 {transform: rotate(170deg)}.ang36 {transform: rotate(175deg)}.ang37 {transform: rotate(180deg)}.ang38 {transform: rotate(185deg)}.ang39 {transform: rotate(190deg)}.ang40 {transform: rotate(195deg)}.ang41 {transform: rotate(200deg)}.ang42 {transform: rotate(205deg)}.ang43 {transform: rotate(210deg)}.ang44 {transform: rotate(215deg)}.ang45 {transform: rotate(220deg)}.ang46 {transform: rotate(225deg)}.ang47 {transform: rotate(230deg)}.ang48 {transform: rotate(235deg)}.ang49 {transform: rotate(240deg)}.ang50 {transform: rotate(245deg)}.ang51 {transform: rotate(250deg)}.ang52 {transform: rotate(255deg)}.ang53 {transform: rotate(260deg)}.ang54 {transform: rotate(265deg)}.ang55 {transform: rotate(270deg)}.ang56 {transform: rotate(275deg)}.ang57 {transform: rotate(280deg)}.ang58 {transform: rotate(285deg)}.ang59 {transform: rotate(290deg)}.ang60 {transform: rotate(295deg)}.ang61 {transform: rotate(300deg)}.ang62 {transform: rotate(305deg)}.ang63 {transform: rotate(310deg)}.ang64 {transform: rotate(315deg)}.ang65 {transform: rotate(320deg)}.ang66 {transform: rotate(325deg)}.ang67 {transform: rotate(330deg)}.ang68 {transform: rotate(335deg)}.ang69 {transform: rotate(340deg)}.ang70 {transform: rotate(345deg)}.ang71 {transform: rotate(350deg)}.ang72 {transform: rotate(355deg)}
    .fanbox{position:relative;margin:13%;width: 74%; height: 74%;border-radius:50%;background:#80808061}
    
    #fan.active .oscillate{animation:oscillate 8s infinite linear}
    #fan.active .oscillate30{animation:oscillate30 8s infinite linear}
    #fan.active .oscillate60{animation:oscillate60 8s infinite linear}
    #fan.active .oscillate90{animation:oscillate90 8s infinite linear}
    #fan.active .oscillate118{animation:oscillate120 8s infinite linear}
    #fan.active .blades{transform-origin:50% 50%;animation:blades 3s infinite linear;transform-box:fill-box!important}

    .blades div{position:absolute;margin:15% 0 0 15%;width:35%;height:35%;border-radius:100% 50% 0;background:#989898;transform-origin:100% 100%}
    .blades{width:100%;height:100%}
    
    .fan{top:0;transform-origin:0 250%}
    .fan,.fan1{position:absolute;left:0;margin-left:50%;width:1%;height:20%;background:#fff}
    .fan1{top:20%;transform-origin:0 150%}
    .c1{top:20%;left:20%;width:60%;height:60%;border:2px solid #fff;border-radius:50%;cursor:pointer;baskground:#ffffff00}
    .c1,.c2{position:absolute;box-sizing:border-box}
    .c2{top:-1%;left:-1%;width:102%;height:102%;border:10px solid #f7f7f7;border-radius:50%;background: #ffffff01;}
    .c3{position:absolute;top:40%;left:40%;box-sizing:border-box;width:20%;height:20%;border-radius:50%;background:#fff;color:#ddd}
    
    .c3 ha-icon{
      width: 80%;
      height: 80%;
      outline: none;
      --mdc-icon-size: 100%;
      top: 10%;
      right: 10%;
    }
    

    .c1 .wrapper{
      width: calc(50% + 2px);
      height: calc(100% + 4px);
      position: absolute;
      top:-2px;
      overflow: hidden;
    }
    .c1 .rightc{
      right:-2px;
    }
    .c1 .leftc{
      left:-2px;
    }
    .c1 .circle{
      width: 200%;
      height: 100%;
      box-sizing:border-box;
      border:2px solid transparent;
      border-radius: 50%;
      position: absolute;
      top:0;
      transform : rotate(-135deg);
    }
    .c1 .rightcircle{
      border-top:2px solid #63ff69;
      border-right:2px solid #63ff69;
      right:0;
    
    }
    .c1 .leftcircle{
      border-bottom:2px solid #63ff69;
      border-left:2px solid #63ff69;
      left:0;
    
    }
    .c1 .battery_charge{
      -webkit-animation: battery_charge 2s linear infinite;
    }
    .c1.red .leftcircle{
      border-bottom:2px solid #ff5722;
      border-left:2px solid #ff5722;
    }
    .name {
      width: 100%;
      position: absolute;
      bottom: 0px;
      margin-bottom: 5px;
      text-align: center;
      opacity: 0.5;
    }
    .chevron{position: absolute;
      top: calc(50% - 20px);
      height: 40px;
      width: 40px;
      color: var(--header-color);
      z-index:100;
    }
    .speed{position: absolute;
      left: calc(50% - 20px);
      height: 40px;
      width: 40px;
      color: var(--header-color);
      z-index:100;
    }
    .show{display: block;}
    .hidden{display: none;}

    .chevron.left{left: 0;border-radius:20px;--mdc-icon-button-size: 40px;}
    .chevron.right{right: 0;border-radius:20px;--mdc-icon-button-size: 40px;}
    
    .speed.top{top: 0;border-radius:20px;}
    .speed.bottom{bottom: 0;border-radius:20px;}
    
    .state{
      display: none;
    }
    .state.show{
      display: block;
    }
    mwc-slider.hidden{
      display: block;
      left: 100%;
    }
    @-webkit-keyframes circle_right{
      0%{
          -webkit-transform: rotate(-135deg);
      }
      50%,100%{
          -webkit-transform: rotate(45deg);
      }
    }
    @-webkit-keyframes circle_left{
      0%,50%{
          -webkit-transform: rotate(-135deg);
      }
      100%{
          -webkit-transform: rotate(45deg);
      }
    }
    
    @-webkit-keyframes battery_charge{
      50%{
        opacity:1;
    }
      0%,100%{
        opacity:0;
    }
    }
    
    @keyframes blades{0%{transform:translate(0,0) rotate(0)}
    to{transform:translate(0,0) rotate(3600deg)}
    }
    @keyframes oscillate{0%{transform:perspective(10em) rotateY(0)}
    25%{transform:perspective(10em) rotateY(40deg)}
    50%{transform:perspective(10em) rotateY(0)}
    75%{transform:perspective(10em) rotateY(-40deg)}
    100%{transform:perspective(10em) rotateY(0)}
    }
    @keyframes oscillate30{0%{transform:perspective(10em) rotateY(0)}
    25%{transform:perspective(10em) rotateY(10deg)}
    50%{transform:perspective(10em) rotateY(0)}
    75%{transform:perspective(10em) rotateY(-10deg)}
    100%{transform:perspective(10em) rotateY(0)}
    }
    @keyframes oscillate60{0%{transform:perspective(10em) rotateY(0)}
    25%{transform:perspective(10em) rotateY(20deg)}
    50%{transform:perspective(10em) rotateY(0)}
    75%{transform:perspective(10em) rotateY(-20deg)}
    100%{transform:perspective(10em) rotateY(0)}
    }
    @keyframes oscillate90{0%{transform:perspective(10em) rotateY(0)}
    25%{transform:perspective(10em) rotateY(30deg)}
    50%{transform:perspective(10em) rotateY(0)}
    75%{transform:perspective(10em) rotateY(-30deg)}
    100%{transform:perspective(10em) rotateY(0)}
    }
    @keyframes oscillate120{0%{transform:perspective(10em) rotateY(0)}
    25%{transform:perspective(10em) rotateY(40deg)}
    50%{transform:perspective(10em) rotateY(0)}
    75%{transform:perspective(10em) rotateY(-40deg)}
    100%{transform:perspective(10em) rotateY(0)}
    }
    `
  }
  _mouseover(e){
    this.over=true;
  }
  _clickSlider(e){
    const target = e.target;
    clearTimeout(this._timer1)
    clearTimeout(this._timer2)
    clearTimeout(this._timer3)
  }
  _changDelay(e){

    const target = e.target;
    let attr = this.hass.states[this.config.entity].attributes
    attr['delay_off_countdown'] = "^_^"
    this.hass.callService('xiaomi_miio_fan', 'fan_set_delay_off', {
      entity_id: this.config.entity,
      delay_off_countdown: target.value
    })
    this._timer3 = setTimeout(() => {
      target.classList.add("hidden")
    },1500)
    this._timer1 = setTimeout(() => {this.over=false},5000)
    
  }
  _changAngle(e){
    // clearTimeout(this._timer2);
    const target = e.target;
    let attr = this.hass.states[this.config.entity].attributes
    attr['angle'] = "^_^"
    if(target.value){
      this.hass.callService('xiaomi_miio_fan', 'fan_set_oscillation_angle', {
        entity_id: this.config.entity,
        angle: target.value
      })
    }else{
      this.hass.callService('fan', 'oscillate', {
        entity_id: this.config.entity,
        oscillating: false
      });
    }
    this._timer2 = setTimeout(() => {
      target.classList.add("hidden")
    },1500)
    this._timer1 = setTimeout(() => {this.over=false},5000)
    
  }
  _action(e){
    const target = e.currentTarget;
    

    if (!this.config || !this.hass || !target ) {
        return;
    }
    let attr = this.hass.states[this.config.entity].attributes
    let state = this.hass.states[this.config.entity].state
    if(target.cmd == "toggle"){
      this.hass.callService('fan', 'toggle', {
        entity_id: this.config.entity
      });
    }else if(target.cmd == "buzzer"){
      this.hass.callService('xiaomi_miio_fan', attr['buzzer']?"fan_set_buzzer_off":"fan_set_buzzer_on", {
        entity_id: this.config.entity
      });
    }else if(target.cmd == "natural_speed" && state=="on"){
      this.hass.callService('xiaomi_miio_fan', attr['natural_speed'] || attr['mode']==='nature'?"fan_set_natural_mode_off":"fan_set_natural_mode_on", {
        entity_id: this.config.entity
      });
    }else if(target.cmd == "lock"){
      this.hass.callService('xiaomi_miio_fan', attr['child_lock']?"fan_set_child_lock_off":"fan_set_child_lock_on", {
        entity_id: this.config.entity
      });
    }else if(target.cmd == "set_direction_left" && state=="on"){
      this.hass.callService('fan', 'set_direction', {
        entity_id: this.config.entity,
        direction: 'left'
      });
    }else if(target.cmd == "set_direction_right" && state=="on"){
      this.hass.callService('fan', 'set_direction', {
        entity_id: this.config.entity,
        direction: 'right'
      });
    }else if(target.cmd == "oscillate"){
      clearTimeout(this._timer2);
      if(attr['oscillate']){
        target.parentNode.parentNode.querySelector("#angleslider").classList.remove("hidden")
        this._timer2 = setTimeout(() => {
          target.parentNode.parentNode.querySelector("#angleslider").classList.add("hidden")
        },5000)
      }else{
        this.hass.callService('fan', 'oscillate', {
          entity_id: this.config.entity,
          oscillating: true
        });
        target.classList.remove("hidden")
      }
    }else if(target.cmd == "delay"){
      clearTimeout(this._timer3);
      target.parentNode.parentNode.querySelector("#delayslider").classList.remove("hidden")
      this._timer2 = setTimeout(() => {
        target.parentNode.parentNode.querySelector("#delayslider").classList.add("hidden")
      },5000)
    }else if(target.cmd == "more"){
      this.fire('hass-more-info', { entityId: this.config.entity });
    }
  }
  onMouseMove (e) {
    let state = this.hass.states[this.config.entity].state
    if(state=="on" && this.over){
      e.preventDefault();
    }
    if ( this.x0 !== false ) {
      let value = this.getValue( e );
      this.speedvalue=value;
    }
  }

  onMouseDown(e){
    const target = e.target;
    const card = e.currentTarget.parentNode.parentNode.parentNode.parentNode;
    let c = card.getBoundingClientRect().width/2
    this.x0 = card.getBoundingClientRect().right-c;
    this.y0 = card.getBoundingClientRect().bottom-c;
    let value = this.getValue(e);
    // this.updatevalue( value );
    this.speedvalue=value;
  }
  onMouseUp(e) {
    clearTimeout(this._timer1);
    let v = this.speedvalue;
    let state = this.hass.states[this.config.entity].state
    if(this.x0 && state=="on"){
        this.hass.callService('fan', 'set_percentage', {
          entity_id: this.config.entity,
          percentage: Math.floor(this.speedvalue*100)
        });
    }
    this.x0 = false;
    this._timer1 = setTimeout(() => {this.over=false},5000)
  }

  getValue ( e ) {
		var x, y, result, a;
		x = !! e.touches ? e.touches[ 0 ].clientX : e.clientX;
		y = !! e.touches ? e.touches[ 0 ].clientY : e.clientY;
		x = x - this.x0;
		y = - y + this.y0;
		a = Math.atan( y / x ) + Math.PI / 2;
		result = x < 0 ? Math.PI + a : a;
		result /= 2 * Math.PI;
		result = 1 - result;
		return result;
  }
  
  fire(type, detail, options) {
  
    options = options || {}
    detail = detail === null || detail === undefined ? {} : detail
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed,
    })
    
    e.detail = detail
    this.dispatchEvent(e)
    return e
  }
}

customElements.define('fan-xiaomi', FanXiaomiCard);

export class FanXiaomiCardEditor extends LitElement {
  setConfig(config) {
    const preloadCard = type => window.loadCardHelpers()
      .then(({ createCardElement }) => createCardElement({type}))
    preloadCard("weather-forecast");
    customElements.get("hui-weather-forecast-card").getConfigElement();
    this.config = config;
  }

  static get properties() {
      return {
          hass: {},
          config: {}
      };
  }
  render() {
    var fanRE = new RegExp("fan\.")
    return html`
    <div class="card-config">
      <paper-input
          label="${this.hass.localize("ui.panel.lovelace.editor.card.generic.title")} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})"
          .value="${this.config.name}"
          .configValue="${"name"}"
          @value-changed="${this._valueChanged}"
      ></paper-input>
      <div class="side-by-side">
        <paper-input-container>
            <label slot="label">${this.hass.localize("ui.panel.lovelace.editor.card.generic.aspect_ratio")} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")}) ${this.config.aspect_ratio?this.config.aspect_ratio:1}</label>
            
            <input type="range" class="aspect_ratio" value="${this.config.aspect_ratio?this.config.aspect_ratio:1}" min="0.3" max="1.0" step="0.01" slot="input" .configValue="${"aspect_ratio"}" @input="${this._valueChanged}">
        </paper-input-container>

        <paper-input-container>
            <label slot="label">背景颜色</label>
            <input type="color" value="${this.config.background_color?this.config.background_color:""}" slot="input" .configValue="${"background_color"}" @input="${this._valueChanged}">
            <ha-icon-button slot="suffix" icon="${this.config.background_color?"mdi:palette":"mdi:palette-outline"}" title="${this.hass.localize("ui.panel.lovelace.editor.card.map.delete")}" .type="${"background_color"}" @click=${this._delEntity}></ha-icon-button>
        </paper-input-container>
      </div>
      <ha-entity-picker
        .label="${this.hass.localize(
          "ui.panel.lovelace.editor.card.generic.entity"
        )} (${this.hass.localize(
          "ui.panel.lovelace.editor.card.config.required"
        )})"
        .hass=${this.hass}
        .value=${this.config.entity}
        .configValue=${"entity"}
        .includeDomains=${includeDomains}
        @change=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>
    </div>
    `
  }
  static get styles() {
    return css `
    a{
      color: var(--accent-color);
    }
    .side-by-side {
        display: flex;
        align-items: flex-end;
        flex-wrap: wrap;
      }
      .side-by-side > * {
        flex: 1;
        padding-right: 4px;
      }
      .info > * {
        flex: none;
        width: calc(33% - 10px);
        padding: 0 5px;
      }

      ha-switch{
        margin-right: 10px;
      }
      ha-icon{
        --mdc-icon-button-size: 24px;
      }
      .fs{
          flex:0.3;
      }
      .aspect_ratio{
        appearance: slider-horizontal;
        color: rgb(16, 16, 16);
        cursor: default;
        padding: initial;
        border: initial;
        margin: 2px;
      }
    `
  }
  _focusEntity(e){
    // const target = e.target;
    e.target.value = ''
  }

  _valueChanged(e){
    const target = e.target;

    if (!this.config || !this.hass || !target ) {
        return;
    }
    let configValue = target.configValue
    let newConfig = {
        ...this.config
    };
        newConfig[configValue] = target.value
    this.configChanged(newConfig)
  }

  configChanged(newConfig) {
    const event = new Event("config-changed", {
      bubbles: true,
      composed: true
    });
    event.detail = {config: newConfig};
    this.dispatchEvent(event);
  }
}
customElements.define("fan-xiaomi-card-editor", FanXiaomiCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "fan-xiaomi",
  name: "Xiaomi Fan Lovelace Card",
  preview: true, // Optional - defaults to false
  description: "小米电风扇卡片" // Optional
});

