/*
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2019-10-12 02:38:30
 * @LastEditors   : fineemb
 * @LastEditTime  : 2020-07-28 19:10:09
 */

console.info("%c Xiaomi Fan Card \n%c  Version  1.2.1 ", "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");

const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class FanXiaomi extends HTMLElement {
  constructor() {
    super();
    this.Cmd = []
  }
  static getConfigElement() {
    return document.createElement("fan-xiaomi-card-editor");
  }
  static getStubConfig() {
    return {name: 'Fan',
            entity: ''}
  }
  set hass(hass) {
    this._hass = hass;
    let entityId
    var patt = new RegExp("^fan")
    if(this.config.entity){
      entityId = this.config.entity;
    }else{
      Object.keys(hass.states).filter(a => patt.test(a) ).map(entId => {
        if(hass.states[entId].attributes.model != undefined && hass.states[entId].attributes.model.indexOf("fan") != -1){
          entityId = entId;
        }
      });
    }
    const myname = this.config.name;
    const state = hass.states[entityId];
    const ui = this.getUI();
    this.old_angle = state.attributes['angle'];

    if (!this.card) {
      //初始化界面
      this.x0 = false;
      this.flag = true;
      this.min = 0;
      this.max = 100;
      const card = document.createElement('div')
      card.id = 'aspect-ratio'
      card.appendChild(ui);      
      ui.onmouseover = () => {
        ui.querySelector('.ellipsis').classList.replace('show','hidden')
        ui.querySelector('#buttons').classList.replace('hidden','show')
        
        if(ui.querySelector('.active .left')){
          ui.querySelector('svg').classList.replace('hidden','show')
          ui.querySelector('.active .left').classList.replace('hidden','show')
          ui.querySelector('.active .right').classList.replace('hidden','show')
        }
      }
      ui.onmouseout = () => {
        ui.querySelector('.left').classList.replace('show','hidden')
        ui.querySelector('.right').classList.replace('show','hidden')
        ui.querySelector('.ellipsis').classList.replace('hidden','show')
        ui.querySelector('#buttons').classList.replace('show','hidden')
        ui.querySelector('svg').classList.replace('show','hidden')
      }
      ui.ontouchstart = () => {
        clearTimeout(this.tid)
        ui.querySelector('.ellipsis').classList.replace('show','hidden')
        ui.querySelector('#buttons').classList.replace('hidden','show')
        
        if(ui.querySelector('.active .left')){
          ui.querySelector('svg').classList.replace('hidden','show')
          ui.querySelector('.active .left').classList.replace('hidden','show')
          ui.querySelector('.active .right').classList.replace('hidden','show')
        }
      }

      ui.ontouchend = () => {
        this.tid = setTimeout(function() { 
          ui.querySelector('.left').classList.replace('show','hidden')
          ui.querySelector('.right').classList.replace('show','hidden')
          ui.querySelector('.ellipsis').classList.replace('hidden','show')
          ui.querySelector('#buttons').classList.replace('show','hidden')
          ui.querySelector('svg').classList.replace('show','hidden')
         }, 5000);
      }

      card.querySelector('.ellipsis').textContent = myname;
      ui.querySelector('#more').onclick = () => {
        this.fire('hass-more-info', { entityId: entityId });
      }
      this.card = card;
      this.appendChild(card);
      
      //执行命令
      ui.querySelector('.c3').onclick = () => {
        hass.callService('fan', 'toggle', {
          entity_id: entityId
        });
      }
      ui.querySelector('#oscillate').onclick = () => {
        let new_angle = this.old_angle+30>120?0:this.old_angle+30;
        this.old_angle = new_angle;
        if(new_angle){
          hass.callService('fan', 'xiaomi_miio_set_oscillation_angle', {
            entity_id: entityId,
            angle: new_angle
          });
        }else{
          if(this.Cmd["oscillate"]){
            hass.callService('fan', 'xiaomi_miio_set_oscillation_angle', {
              entity_id: entityId,
              angle: 30
            });
            new_angle = 30;
          }else{
            hass.callService('fan', 'oscillate', {
              entity_id: entityId,
              oscillating: this.Cmd['oscillate']
            });
            new_angle = 0;
          }
        }
        this.card.querySelector('#angle').textContent = "^_^" 
      }
      ui.querySelector('.right').onclick = () => {
        hass.callService('fan', 'set_direction', {
          entity_id: entityId,
          direction: 'right'
        });
      }
      ui.querySelector('.left').onclick = () => {
        hass.callService('fan', 'set_direction', {
          entity_id: entityId,
          direction: 'left'
        });
      }
      ui.querySelector('#lock').addEventListener('click', () => this._setService(entityId,hass,'lock'));
      ui.querySelector('#buzzer').addEventListener('click', () => this._setService(entityId,hass,'buzzer'));
      ui.querySelector('#bnatural').addEventListener('click', () => this._setService(entityId,hass,'natural_speed'));

      this.querySelector('svg').addEventListener('mousedown', (e) => this.onMouseDown(e,this),false);
      this.querySelector('svg').addEventListener('touchstart', (e) => this.onMouseDown(e,this),false);

      this.addEventListener('mouseup', (e) => this.onMouseUp(e,this),false);
      this.addEventListener('touchend', (e) => this.onMouseUp(e,this),false);

      this.addEventListener('mousemove', (e) => this.onMouseMove(e,this),{passive: false});
      this.addEventListener('touchmove', (e) => this.onMouseMove(e,this),{passive: false});

    }
    if(state.state==="unavailable"){
      // 离线
      this.card.classList.add('offline');
      this.querySelector('svg').classList.replace('show','hidden')
      this.card.querySelector('.ellipsis').textContent = myname+'(离线)';
      this.card.querySelector('.fanbox').classList.remove('active');
      this.card.querySelector('#fan').classList.remove('active');
      this.card.querySelector('.fanbox').classList.remove('oscillat');
    }else{
      //在线
      const attrs = state.attributes;
      this.card.classList.remove('offline');
      this.card.querySelector('.ellipsis').textContent = myname;
      if(state.state==="on"){
        //运行
        // this.querySelector('svg').classList.replace('hidden','show')
        attrs['natural_speed']?this.querySelector('#speed').style.strokeDashoffset = ( (1-attrs['natural_speed']/100) * Math.PI*340 ).toString():this.querySelector('#speed').style.strokeDashoffset = ( (1-attrs['direct_speed']/100) * Math.PI*340 ).toString();
        this.card.querySelector('.fanbox').classList.add('active')
        this.card.querySelector('#fan').classList.add('active')
        this.card.querySelector('.active .blades').style.animationDuration=(attrs.natural_speed?5-attrs.natural_speed/100*5+1:5-attrs.direct_speed/100*5+1)+'s';
        attrs['oscillate']?this.card.querySelector('.fanbox').classList.add('oscillat'):this.card.querySelector('.fanbox').classList.remove('oscillat');
        if(attrs['natural_speed']){
          this.card.querySelector('#power').classList.remove('show');
          this.card.querySelector('#direct').classList.remove('show');
          this.card.querySelector('#natural').classList.add('show');
        }else{
          this.card.querySelector('#power').classList.remove('show');
          this.card.querySelector('#direct').classList.add('show');
          this.card.querySelector('#natural').classList.remove('show');
        }
      }else{
        //关机
        this.querySelector('svg').classList.replace('show','hidden')
        this.card.querySelector('.fanbox').classList.remove('active');
        this.card.querySelector('#power').classList.add('show');
        this.card.querySelector('#direct').classList.remove('show');
        this.card.querySelector('#natural').classList.remove('show');
        this.card.querySelector('#fan').classList.remove('active');
      }
      this.card.querySelector('#angle').textContent = attrs['angle'] ;
      attrs['buzzer']?this.card.querySelector('#buzzer').classList.add('active'):this.card.querySelector('#buzzer').classList.remove('active');
      attrs['child_lock']?this.card.querySelector('#lock').classList.add('active'):this.card.querySelector('#lock').classList.remove('active');
      attrs['natural_speed']?this.card.querySelector('#bnatural').classList.add('active'):this.card.querySelector('#bnatural').classList.remove('active');
      attrs['oscillate']?this.card.querySelector('#oscillate').classList.add('active'):this.card.querySelector('#oscillate').classList.remove('active');
      attrs['oscillate']?this.card.querySelector('#angle').textContent = attrs['angle']:this.card.querySelector('#angle').textContent = 0 ;

      attrs['battery_charge']==='progress'?this.card.querySelector('.rightc').classList.add('battery_charge'):this.card.querySelector('.rightc').classList.remove('battery_charge');
      attrs['battery_charge']==='progress'?this.card.querySelector('.leftc').classList.add('battery_charge'):this.card.querySelector('.leftc').classList.remove('battery_charge');
      if(attrs['battery']){
        let battery = attrs['battery']
        if(battery<50){
          this.card.querySelector('.leftcircle').style.transform = "rotate("+(battery/(100/360)-135)+"deg)";
          this.card.querySelector('.rightcircle').style.transform = "rotate(-135deg)";
        }else{
          this.card.querySelector('.leftcircle').style.transform = "rotate(45deg)";
          this.card.querySelector('.rightcircle').style.transform = "rotate("+(battery/(100/360)-180-135)+"deg)";
        }
      }
    }
    this.Cmd["lock"] = hass.states[entityId].attributes['child_lock']?"xiaomi_miio_set_child_lock_off":"xiaomi_miio_set_child_lock_on";
    this.Cmd["oscillate"] = hass.states[entityId].attributes['oscillating']?false:true;
    this.Cmd["buzzer"] = hass.states[entityId].attributes['buzzer']?"xiaomi_miio_set_buzzer_off":"xiaomi_miio_set_buzzer_on";
    this.Cmd["natural_speed"] = hass.states[entityId].attributes['natural_speed']?"xiaomi_miio_set_natural_mode_off":"xiaomi_miio_set_natural_mode_on";
  }
  _setService(entityId,hass,service){
    hass.callService('fan', this.Cmd[service], {
      entity_id: entityId
    });
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
  setConfig(config) {
    // if (!config.entity) {
    //   throw new Error('你需要定义一个实体');
    // }
    this.config = config;
  }
  
  onMouseMove ( e, that ) {
    e.preventDefault();
    if ( that.x0 !== false ) {
      let value = that.getValue( e );
      that.update( value );
    }
  }
  onMouseDown (  e, that ) {
    // this.querySelector('#speed').style.strokeWidth = 10
    that.card.getBoundingClientRect();
    let c = that.card.getBoundingClientRect().width/2
    that.x0 = that.card.getBoundingClientRect().right-c;
    that.y0 = that.card.getBoundingClientRect().bottom-c;
    let value = that.getValue( e );
    that.update( value );
  }

  onMouseUp ( e, that ) {
    if(that.x0){
        that.flag = false;
        let entity = that.config.entity;
        that._hass.callService('fan', 'set_speed', {
            entity_id: entity,
            speed: that.value
          });
        if (that._timeoutHandlerMode) clearTimeout(that._timeoutHandlerMode);
        that._timeoutHandlerMode = setTimeout(() => {
            that.flag = true;
        }, 5 * 1000);
    }
    that.x0 = false;
    // this.querySelector('#speed').style.strokeWidth = 10
  }
  update ( v ) {
		this.computeValue( v );
    // this.temptext.textContent = this.value;
  }
  computeValue ( v ) {
		this.querySelector('#speed').style.strokeDashoffset = ( (1-v) * Math.PI*340 ).toString();
		let value = v * ( this.max - this.min ) + this.min;
        let step = 1, val = value, m = 0;
        
		//Convert to integers to avoid floating point operation issues.
		if ( val !== parseInt( val ) || step !== parseInt( step ) ) {
			while ( val !== parseInt( val ) || step !== parseInt( step ) ) {
				val *= 10;
				step *= 10;
				m++;
				if ( m > 5 ) {//Not much sense to go further of even 2 actually.. ?
					val = parseInt( val );
					step = parseInt( step );
				}
			}
        }
        
		value = ( val - val % step ) / Math.pow( 10, m );
		this.value = value;
  }
  setValue ( v ) {
    if(this.flag){
        v = ( v - this.min ) / ( this.max - this.min );
        this.update( v );
    }
  };
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

/*********************************** UI设置 ************************************/
getUI() {

  let csss='';
  for(var i=1;i<73;i++){
    csss+='.ang'+i+` {
        transform: rotate(`+(i-1)*5+`deg);
    }`
  }
  let fans='';
  for(var i=1;i<73;i++){
    fans+=`<div class="fan ang`+i+`"></div>`
  }
  let fan1s='';
  for(var i=1;i<73;i+=2){
    fan1s+=`<div class="fan1 ang`+i+`"></div>`
  }
  let fanbox = document.createElement('ha-card')
  fanbox.id = 'fan'
  fanbox.innerHTML = `
<style>
#aspect-ratio {
  position: relative;
}
#aspect-ratio::before {
  content: "";
  display: block;
  padding-bottom: 100%;
}
#aspect-ratio>:first-child {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}
#container{
  height: 100%;
  width: 100%;
  display: flex;
  overflow: hidden;
}
.c_icon {
  position: absolute;
  cursor: pointer;
  top: 0;
  right: 0;
  z-index: 25;
  
}
.c_icon.active{
  color:var(--paper-item-icon-active-color);
  fill:var(--paper-item-icon-active-color);
}
.c_icon #oc{
  stroke:var(--primary-text-color)
}
.c_icon.active #oc{
  stroke:var(--paper-item-icon-active-color);
}
.buttons{
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content:center;
  width: 80%;
  margin: 0 10%;
  background: var(--card-background-color);
}
.buttons>*{
  position: relative;
}
.offline{opacity:0.5}
.icon{overflow:hidden;width:2em;height:2em;vertical-align:-.15em;fill:gray}
.fan-xiaomi-panel{position:absolute;top:0;width:100%;text-align:center}
p{margin:0;padding:0}
.title{margin-top:20px;height:35px;cursor:pointer}
.title p{margin:0;padding:0;font-weight:700;font-size:18px}
.title span{font-size:9pt}
.attr-row{display:flex}
.attr-row .attr{width:100%}
.attr-row .attr-title{font-size:9pt}
.attr-row .attr-value{font-size:14px}
.attr-row .attr:nth-child(2){border-right:1px solid #01be9e;border-left:1px solid #01be9e}
.op-row{display:flex;padding:10px;border-top:3px solid #717376!important}
.op-row .op{width:100%}
.op-row .op button{outline:0;border:none;background:0 0;cursor:pointer}
.op-row .op .icon-waper{display:block;margin-bottom:5px;width:30px;height:30px}
.op-row .op.active button{color:#01be9e!important;text-shadow:0 0 10px #01be9e}
`+csss+`
.fanbox{position:relative;margin:13%;width: 74%; height: 74%;border-radius:50%;background:#80808061}
.fanbox.active.oscillat{animation:oscillate 8s infinite linear}
.blades div{position:absolute;margin:15% 0 0 15%;width:35%;height:35%;border-radius:100% 50% 0;background:#989898;transform-origin:100% 100%}
.blades{width:100%;height:100%}
.fanbox.active .blades{transform-origin:50% 50%;animation:blades 3s infinite linear;transform-box:fill-box!important}
.fan{top:0;transform-origin:0 250%}
.fan,.fan1{position:absolute;left:0;margin-left:50%;width:1%;height:20%;background:#fff}
.fan1{top:20%;transform-origin:0 150%}
.c1{top:20%;left:20%;width:60%;height:60%;border:2px solid #fff;border-radius:50%;cursor:pointer;baskground:#ffffff00}
.c1,.c2{position:absolute;box-sizing:border-box}
.c2{top:-1%;left:-1%;width:102%;height:102%;border:10px solid #f7f7f7;border-radius:50%;background: #ffffff01;}
.c3{position:absolute;top:40%;left:40%;box-sizing:border-box;width:20%;height:20%;border-radius:50%;background:#fff;color:#ddd}
.c3.active{border:2px solid #8dd5c3}
.c3 ha-icon{
  width: 80%;
  height: 80%;
  outline: none;
  --mdc-icon-size: 100%;
  top: 10%;
  right: 10%;
}

#speedsvg {
  position:absolute;
  top: 0;
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
  background: var(--paper-card-background-color);
  color: var(--header-color);
  z-index:100;
}
.speed{position: absolute;
  left: calc(50% - 20px);
  height: 40px;
  width: 40px;
  background: var(--paper-card-background-color);
  color: var(--header-color);
  z-index:100;
}
.show{display: block;}
.hidden{display: none;}
#buttons.show{display: flex;}
#buttons ha-icon-button ,#buttons mwc-icon-button{
  --mdc-icon-button-size: 32px;
}
#buttons tspan{
  text-anchor: middle;
  font-family: Helvetica, sans-serif;
  alignment-baseline: central;
  dominant-baseline: central;
  font-size: 10px;
}
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


</style>
    <div id="container">
      <div class="fanbox">
        <div class="blades ">
          <div class="b1 ang1"></div>
          <div class="b2 ang25"></div>
          <div class="b3 ang49"></div>
        </div>
        `+fans+fan1s+`
         <div class="c2"></div>
        <div class="c3">
            <ha-icon id="power" icon="mdi:power" class="c_icon state show" role="button" tabindex="0" aria-disabled="false"></ha-icon>
            <ha-icon id="direct" icon="mdi:weather-windy" class="c_icon state" role="button" tabindex="0" aria-disabled="false"></ha-icon>
            <ha-icon id="natural" icon="mdi:leaf" class="c_icon state" role="button" tabindex="0" aria-disabled="false"></ha-icon>
        </div>
        <div class="c1">
          <div class="wrapper rightc">
            <div class="circle rightcircle"></div>
          </div>
          <div class="wrapper leftc">
            <div class="circle leftcircle"></div>
          </div>
        </div>
        <svg id="speedsvg" class="hidden" width="100%" height="100%" viewBox="0 0 400 400"><circle id="speed" cx="200" cy="200" r="170" fill="none" class="grab" style="stroke: var(--paper-item-icon-active-color); fill: none; stroke-width: 8; stroke-dasharray: 1068.14; transform: rotate(90deg); transform-origin: 50% 50%; stroke-dashoffset: 44.329;"></circle></svg>
      </div>
    </div>
    <div class="chevron left hidden">
      <ha-icon-button icon="mdi:chevron-left" class="c_icon" role="button" tabindex="0" aria-disabled="false"></ha-icon-button>
    </div>
    <div class="chevron right hidden">
      <ha-icon-button icon="mdi:chevron-right" class="c_icon" role="button" tabindex="0" aria-disabled="false"></ha-icon-button>
    </div>
    <div class="speed top hidden">
      <ha-icon-button icon="mdi:chevron-double-up" class="c_icon" role="button" tabindex="0" aria-disabled="false"></ha-icon-button>
    </div>
    <div class="speed bottom hidden">
      <ha-icon-button icon="mdi:chevron-down" class="c_icon" role="button" tabindex="0" aria-disabled="false"></ha-icon-button>
    </div>
    <div class="prop">
      <ha-icon-button id="more" icon="mdi:dots-vertical" class="c_icon" role="button" tabindex="0" aria-disabled="false"></ha-icon-button>
    </div>
    <div id="buttons" class="buttons hidden">
      <ha-icon-button id="lock" icon="hass:lock" class="c_icon" role="button" tabindex="0" aria-disabled="false"></ha-icon-button>
      <mwc-icon-button id="oscillate" class="c_icon ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M4,6l1,-6l5,6.5z"></path>
          <path id="oc" d="M3,7A 10 10, 0, 1, 0, 5.5 4," fill="none" style="stroke-width: 2"></path>
          <text  x="12" y="12">
            <tspan id="angle">120</tspan>
          </text>
        </svg>
      </mwc-icon-button>
      <ha-icon-button id="bnatural" icon="mdi:leaf" class="c_icon " role="button" tabindex="0" aria-disabled="false"></ha-icon-button>
      <ha-icon-button id="buzzer" icon="mdi:surround-sound" class="c_icon " role="button" tabindex="0" aria-disabled="false"></ha-icon-button>
    </div>
    <div class="header" style="font-size: 9px;">   
        <div class="name">
          <span class="ellipsis show" style="">衣帽间</span>
        </div>
    </div>
</div>
`
  return fanbox
}

// 加入日志开关
log() {
  // console.log(...arguments)
}
}

customElements.define('fan-xiaomi', FanXiaomi);

export class FanXiaomiCardEditor extends LitElement {
  setConfig(config) {
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
          .configValue="${"title"}"
          @value-changed="${this._titleChanged}"
      ></paper-input>
      <paper-input-container >
          <label slot="label">${this.hass.localize("ui.panel.lovelace.editor.card.entities.name")}</label>
          <input type="text" value="${this.config.entity}" slot="input" list="entitieslist" autocapitalize="none" @change=${this._addEntity} @focus=${this._focusEntity}>
      </paper-input-container>
    </div>
    <datalist id="entitieslist">
        ${Object.keys(this.hass.states).filter(a => fanRE.test(a) ).map(entId => html`
            <option value=${entId}>${this.hass.states[entId].attributes.friendly_name || entId}</option>
        `)}
    </datalist>
    `
  }
  _focusEntity(e){
    // const target = e.target;
    e.target.value = ''
  }

  _titleChanged(e){
    const target = e.target;

    if (!this.config || !this.hass || !target ) {
        return;
    }
    
    if(target.configValue == "title"){
        this.config = {
            ...this.config,
            "name": target.value
        };
    }
    this.configChanged(this.config)
  }
  _addEntity(ev){
    const target = ev.target.value;
    if (!this.config || !this.hass || !this.hass.states[target]) {
      return;
    }
    this.config = {
        ...this.config,
        "entity": target
    };
    this.configChanged(this.config)

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
  name: "电风扇",
  preview: true, // Optional - defaults to false
  description: "小米电风扇卡片" // Optional
});