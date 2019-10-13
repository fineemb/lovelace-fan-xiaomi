/*
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2019-10-12 02:38:30
 * @LastEditors   : fineemb
 * @LastEditTime  : 2019-10-13 16:10:07
 */

class FanXiaomi extends HTMLElement {
  set hass(hass) {


    const entityId = this.config.entity;
    const style = this.config.style || '';
    const myname = this.config.name;
    const state = hass.states[entityId];
    const ui = this.getUI();

    if(state===undefined){
      if (!this.card) {
        const card = document.createElement('ha-card');
        card.className = 'fan-xiaomi';
        card.appendChild(ui);
        card.classList.add('offline');
        this.card = card;
        this.appendChild(card);
        ui.querySelector('.var-title').textContent = this.config.name+'(离线)';
        return;
      }
    }

    const attrs = state.attributes;
    const temperature = attrs['temperature'] || "--";
    const humidity = attrs['humidity'] || "--";

    if (!this.card) {

      const card = document.createElement('ha-card');
      card.className = 'fan-xiaomi'

      // 创建UI
      card.appendChild(ui)

      //调整风扇角度事件绑定
      ui.querySelector('.left').onmouseover = () => {
        ui.querySelector('.left').classList.replace('hidden','show')
      }
      ui.querySelector('.left').onmouseout = () => {
        ui.querySelector('.left').classList.replace('show','hidden')
      }
      ui.querySelector('.left').onclick = () => {
        this.log('左转5度')
        if(state==="on"){
          hass.callService('fan', 'set_direction', {
            entity_id: entityId,
            direction: "left"
          });
      }
      }
      ui.querySelector('.right').onmouseover = () => {
        ui.querySelector('.right').classList.replace('hidden','show')
      }
      ui.querySelector('.right').onmouseout = () => {
        ui.querySelector('.right').classList.replace('show','hidden')
      }
      ui.querySelector('.right').onclick = () => {
        this.log('左转5度')
        if(state==="on"){
          hass.callService('fan', 'set_direction', {
            entity_id: entityId,
            direction: "right"
          });
        }
        return false;
      }
      // 定义事件
      ui.querySelector('.c1').onclick = () => {
        this.log('开关')
        hass.callService('fan', 'toggle', {
          entity_id: entityId
        });
      }
      ui.querySelector('.var-lock').onclick = () => {
        this.log('童锁')
        let u = ui.querySelector('.var-lock')
        if (u.classList.contains('active') === false) {
          u.classList.add('active')
          hass.callService('fan', 'xiaomi_miio_set_child_lock_on', {
              entity_id: entityId
          });
        }else{
          u.classList.remove('active')
            hass.callService('fan', 'xiaomi_miio_set_child_lock_off', {
                entity_id: entityId
            });
        } 
      }
      ui.querySelector('.var-natural').onclick = () => {
        //this.log('自然')
        let nowspeed = attrs['direct_speed'];
        let u = ui.querySelector('.var-natural')
        if (u.classList.contains('active') === false) {
          nowspeed = attrs['direct_speed'];
          u.classList.add('active')
          u.innerHTML = '<button><span class="icon-waper"><iron-icon icon="mdi:leaf"></iron-icon></span>自然</button>'
          hass.callService('fan', 'xiaomi_miio_set_natural_mode_on', {
              entity_id: entityId
          });
          hass.callService('fan', 'SET_SPEED', {  
            entity_id: entityId,
            speed: nowspeed
          });
        }else{
          u.classList.remove('active')
          u.innerHTML = '<button><span class="icon-waper"><iron-icon icon="mdi:weather-windy"></iron-icon></span>直吹</button>'
            hass.callService('fan', 'xiaomi_miio_set_natural_mode_off', {
                entity_id: entityId
            });
            nowspeed = attrs['natural_speed'];
            hass.callService('fan', 'SET_SPEED', {  
              entity_id: entityId,
              speed: nowspeed
            });

        } 
      }
      ui.querySelector('.var-oscillating').onclick = () => {
        this.log('摆头')
        let u = ui.querySelector('.var-oscillating')
        if (u.classList.contains('active') === false) {
          u.classList.add('active')
                hass.callService('fan', 'oscillate', {
                    entity_id: entityId,
                    oscillating: true
                });
            }else{
              u.classList.remove('active')
                hass.callService('fan', 'oscillate', {
                    entity_id: entityId,
                    oscillating: false
                });
            } 
      }
      ui.querySelector('.var-title').onclick = () => {
        this.log('对话框')
        card.querySelector('.dialog').style.display = 'block'
      }
      this.card = card;
      this.appendChild(card);
    }
    //设置值更新UI
    this.setUI(this.card.querySelector('.fan-xiaomi-panel'), {
      title: myname || attrs['friendly_name'],
      battery: attrs['battery'] || "--",
      natural_speed: attrs['natural_speed'],
      speed_level: attrs['speed_level'],
      temperature: temperature,
      humidity: humidity,
      state: state.state,
      child_lock: attrs['child_lock'],
      oscillating: attrs['oscillating'],
      led_brightness: attrs['led_brightness']
    })
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('你需要定义一个实体');
    }
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 1;
  }
  
/*********************************** UI设置 ************************************/
getUI() {

  let fanbox = document.createElement('div')
  fanbox.className = 'fan-xiaomi-panel'
  fanbox.innerHTML = `
<style>
.fan-xiaomi {
  position: relative;
  height: 335px;
  overflow: hidden;
  width: 100%;
}
.offline{
  opacity: 0.3;
}
.icon {
  width: 2em;
  height: 2em;
  vertical-align: -0.15em;
  fill: gray;
  overflow: hidden;
}
.fan-xiaomi-panel {
  width: 100%;
}
.fan-xiaomi-panel {
  top: 0;
  position: absolute;
}
p {
  padding: 0;
  margin: 0;
}
.fan-xiaomi-panel {
  text-align: center;
}
.title {
  margin-top: 20px;
  cursor: pointer;
  height: 35px;
}
.title p {
  font-size: 18px;
  padding: 0;
  margin: 0;
  font-weight: bold;
}
.title span {
  font-size: 12px;
}
.attr-row {
  display: flex;
}
.attr-row .attr {
  width: 100%;
}
.attr-row .attr-title {
  font-size: 12px;
}
.attr-row .attr-value {
  font-size: 14px;
}
.attr-row .attr:nth-child(2) {
  border-left: 1px solid #01be9e;
  border-right: 1px solid #01be9e;
}
.op-row {
  display: flex;
  padding: 10px;
  border-top: 3px #717376 solid !important;
}
.op-row .op {
  width: 100%;
}
.op-row .op button {
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
}
.op-row .op .icon-waper {
  display: block;
  width: 30px;
  height: 30px;
  margin-bottom: 5px;
}
.op-row .op.active button {
  color:#01be9e !important;
  text-shadow: 0 0 10px #01be9e;
}
.ang1 {
  transform: rotate(0deg);
}
.ang2 {
  transform: rotate(5deg);
}
.ang3 {
  transform: rotate(10deg);
}
.ang4 {
  transform: rotate(15deg);
}
.ang5 {
  transform: rotate(20deg);
}
.ang6 {
  transform: rotate(25deg);
}
.ang7 {
  transform: rotate(30deg);
}
.ang8 {
  transform: rotate(35deg);
}
.ang9 {
  transform: rotate(40deg);
}
.ang10 {
  transform: rotate(45deg);
}
.ang11 {
  transform: rotate(50deg);
}
.ang12 {
  transform: rotate(55deg);
}
.ang13 {
  transform: rotate(60deg);
}
.ang14 {
  transform: rotate(65deg);
}
.ang15 {
  transform: rotate(70deg);
}
.ang16 {
  transform: rotate(75deg);
}
.ang17 {
  transform: rotate(80deg);
}
.ang18 {
  transform: rotate(85deg);
}
.ang19 {
  transform: rotate(90deg);
}
.ang20 {
  transform: rotate(95deg);
}
.ang21 {
  transform: rotate(100deg);
}
.ang22 {
  transform: rotate(105deg);
}
.ang23 {
  transform: rotate(110deg);
}
.ang24 {
  transform: rotate(115deg);
}
.ang25 {
  transform: rotate(120deg);
}
.ang26 {
  transform: rotate(125deg);
}
.ang27 {
  transform: rotate(130deg);
}
.ang28 {
  transform: rotate(135deg);
}
.ang29 {
  transform: rotate(140deg);
}
.ang30 {
  transform: rotate(145deg);
}
.ang31 {
  transform: rotate(150deg);
}
.ang32 {
  transform: rotate(155deg);
}
.ang33 {
  transform: rotate(160deg);
}
.ang34 {
  transform: rotate(165deg);
}
.ang35 {
  transform: rotate(170deg);
}
.ang36 {
  transform: rotate(175deg);
}
.ang37 {
  transform: rotate(180deg);
}
.ang38 {
  transform: rotate(185deg);
}
.ang39 {
  transform: rotate(190deg);
}
.ang40 {
  transform: rotate(195deg);
}
.ang41 {
  transform: rotate(200deg);
}
.ang42 {
  transform: rotate(205deg);
}
.ang43 {
  transform: rotate(210deg);
}
.ang44 {
  transform: rotate(215deg);
}
.ang45 {
  transform: rotate(220deg);
}
.ang46 {
  transform: rotate(225deg);
}
.ang47 {
  transform: rotate(230deg);
}
.ang48 {
  transform: rotate(235deg);
}
.ang49 {
  transform: rotate(240deg);
}
.ang50 {
  transform: rotate(245deg);
}
.ang51 {
  transform: rotate(250deg);
}
.ang52 {
  transform: rotate(255deg);
}
.ang53 {
  transform: rotate(260deg);
}
.ang54 {
  transform: rotate(265deg);
}
.ang55 {
  transform: rotate(270deg);
}
.ang56 {
  transform: rotate(275deg);
}
.ang57 {
  transform: rotate(280deg);
}
.ang58 {
  transform: rotate(285deg);
}
.ang59 {
  transform: rotate(290deg);
}
.ang60 {
  transform: rotate(295deg);
}
.ang61 {
  transform: rotate(300deg);
}
.ang62 {
  transform: rotate(305deg);
}
.ang63 {
  transform: rotate(310deg);
}
.ang64 {
  transform: rotate(315deg);
}
.ang65 {
  transform: rotate(320deg);
}
.ang66 {
  transform: rotate(325deg);
}
.ang67 {
  transform: rotate(330deg);
}
.ang68 {
  transform: rotate(335deg);
}
.ang69 {
  transform: rotate(340deg);
}
.ang70 {
  transform: rotate(345deg);
}
.ang71 {
  transform: rotate(350deg);
}
.ang72 {
  transform: rotate(355deg);
}
.fanbox {
  background: #80808061;
  width: 150px;
  height: 150px;
  position: relative;
  border-radius: 50%;
  margin: 10px auto;
}
.fanbox.active.oscillat {
  animation: oscillate 8s infinite linear;
}
.blades div {
  height: 35%;
  width: 35%;
  position: absolute;
  transform-origin: 100% 100%;
  border-radius: 100% 50% 0%;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.8);
  background: rgb(152, 152, 152);
  margin: 15% 0 0 15%;
}
.blades {
  height: 100%;
  width: 100%;
}
.fanbox.active .blades {
  animation: blades 3s infinite linear;
  transform-origin: 50% 50%;
  transform-box: fill-box !important;
}
.fan {
  background: white;
  width: 1%;
  height: 20%;
  margin-left: 50%;
  transform-origin: 0 250%;
  position: absolute;
  top: 0;
  left: 0;
}
.fan1 {
  background: white;
  width: 1%;
  height: 20%;
  margin-left: 50%;
  transform-origin: 0 150%;
  position: absolute;
  top: 20%;
  left: 0;
}
.c1 {
  position: absolute;
  top: 20%;
  left: 20%;
  border: 2px solid white;
  width: 60%;
  height: 60%;
  border-radius: 50%;
  box-sizing: border-box;
  baskground: #ffffff00;
  cursor: pointer;
}
.c2 {
  position: absolute;
  top: 0;
  left: 0;
  border: 10px solid #f7f7f7;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-sizing: border-box;
}
.c3 {
  position: absolute;
  top: 40%;
  left: 40%;
  width: 20%;
  height: 20%;
  background: white;
  color: #ddd;
  border-radius: 50%;
  box-sizing: border-box;
}
.c3.active{
  border: 2px solid #8dd5c3;
}
.c3 span iron-icon{
  width: 100%;
  height: 100%;
}
.chevron {
  top: 0;
  position: absolute;
  height: 100%;
  opacity:0;
}
.show {
  opacity:1;
}
.hidden {
  opacity:0;
}
.chevron.left {
  left:-30px
}
.chevron.right {
  right:-30px
}
.chevron span,.chevron span iron-icon{
  height: 100%;
  width: 30px;
}
/* Animation */
@keyframes blades {
  from {
    transform: translate(0, 0) rotate(0deg);
  }
  to {
    transform: translate(0, 0) rotate(3600deg);
  }
}
@keyframes oscillate {
  0% {
    transform: perspective(10em) rotateY(0deg);
  }
  20% {
    transform: perspective(10em) rotateY(40deg);
  }
  40% {
    transform: perspective(10em) rotateY(0deg);
  }
  60% {
    transform: perspective(10em) rotateY(-40deg);
  }
  80% {
    transform: perspective(10em) rotateY(0deg);
  }
  100% {
    transform: perspective(10em) rotateY(40deg);
  }
}

</style>
<div class="title">
<p class="var-title">儿童房</p>
</div>
<div class="fanbox">
  <div class="blades ">
    <div class="b1 ang1"></div>
    <div class="b2 ang25"></div>
    <div class="b3 ang49"></div>
  </div>
  <div class="fan ang1"></div>
  <div class="fan ang2"></div>
  <div class="fan ang3"></div>
  <div class="fan ang4"></div>
  <div class="fan ang5"></div>
  <div class="fan ang6"></div>
  <div class="fan ang7"></div>
  <div class="fan ang8"></div>
  <div class="fan ang9"></div>
  <div class="fan ang10"></div>
  <div class="fan ang11"></div>
  <div class="fan ang12"></div>
  <div class="fan ang13"></div>
  <div class="fan ang14"></div>
  <div class="fan ang15"></div>
  <div class="fan ang16"></div>
  <div class="fan ang17"></div>
  <div class="fan ang18"></div>
  <div class="fan ang19"></div>
  <div class="fan ang20"></div>
  <div class="fan ang21"></div>
  <div class="fan ang22"></div>
  <div class="fan ang23"></div>
  <div class="fan ang24"></div>
  <div class="fan ang25"></div>
  <div class="fan ang26"></div>
  <div class="fan ang27"></div>
  <div class="fan ang28"></div>
  <div class="fan ang29"></div>
  <div class="fan ang30"></div>
  <div class="fan ang31"></div>
  <div class="fan ang32"></div>
  <div class="fan ang33"></div>
  <div class="fan ang34"></div>
  <div class="fan ang35"></div>
  <div class="fan ang36"></div>
  <div class="fan ang37"></div>
  <div class="fan ang38"></div>
  <div class="fan ang39"></div>
  <div class="fan ang40"></div>
  <div class="fan ang41"></div>
  <div class="fan ang42"></div>
  <div class="fan ang43"></div>
  <div class="fan ang44"></div>
  <div class="fan ang45"></div>
  <div class="fan ang46"></div>
  <div class="fan ang47"></div>
  <div class="fan ang48"></div>
  <div class="fan ang49"></div>
  <div class="fan ang50"></div>
  <div class="fan ang51"></div>
  <div class="fan ang52"></div>
  <div class="fan ang53"></div>
  <div class="fan ang54"></div>
  <div class="fan ang55"></div>
  <div class="fan ang56"></div>
  <div class="fan ang57"></div>
  <div class="fan ang58"></div>
  <div class="fan ang59"></div>
  <div class="fan ang60"></div>
  <div class="fan ang61"></div>
  <div class="fan ang62"></div>
  <div class="fan ang63"></div>
  <div class="fan ang64"></div>
  <div class="fan ang65"></div>
  <div class="fan ang66"></div>
  <div class="fan ang67"></div>
  <div class="fan ang68"></div>
  <div class="fan ang69"></div>
  <div class="fan ang70"></div>
  <div class="fan ang71"></div>
  <div class="fan ang72"></div>
  <div class="fan1 ang1"></div>
  <div class="fan1 ang3"></div>
  <div class="fan1 ang5"></div>
  <div class="fan1 ang7"></div>
  <div class="fan1 ang9"></div>
  <div class="fan1 ang11"></div>
  <div class="fan1 ang13"></div>
  <div class="fan1 ang15"></div>
  <div class="fan1 ang17"></div>
  <div class="fan1 ang19"></div>
  <div class="fan1 ang21"></div>
  <div class="fan1 ang23"></div>
  <div class="fan1 ang25"></div>
  <div class="fan1 ang27"></div>
  <div class="fan1 ang29"></div>
  <div class="fan1 ang31"></div>
  <div class="fan1 ang33"></div>
  <div class="fan1 ang35"></div>
  <div class="fan1 ang37"></div>
  <div class="fan1 ang39"></div>
  <div class="fan1 ang41"></div>
  <div class="fan1 ang43"></div>
  <div class="fan1 ang45"></div>
  <div class="fan1 ang47"></div>
  <div class="fan1 ang49"></div>
  <div class="fan1 ang51"></div>
  <div class="fan1 ang53"></div>
  <div class="fan1 ang55"></div>
  <div class="fan1 ang57"></div>
  <div class="fan1 ang59"></div>
  <div class="fan1 ang61"></div>
  <div class="fan1 ang63"></div>
  <div class="fan1 ang65"></div>
  <div class="fan1 ang67"></div>
  <div class="fan1 ang69"></div>
  <div class="fan1 ang71"></div>
  <div class="c2"></div>
  <div class="c3">
    <span class="icon-waper">
       <iron-icon icon="mdi:power"></iron-icon>
    </span>
  </div>
  <div class="c1"></div>
  <div class="chevron left hidden">
    <span class="icon-waper">
    <iron-icon icon="mdi:chevron-left"></iron-icon>
  </div>
  <div class="chevron right hidden">
    <span class="icon-waper">
    <iron-icon icon="mdi:chevron-right"></iron-icon>
  </div>
</span>
</div>
</div>
<div class="attr-row">
<div class="attr">
  <p class="attr-title">电量(%)</p>
  <p class="attr-value var-battery">0</p>
</div>
<div class="attr">
  <p class="attr-title">温度(&#8451;)</p>
  <p class="attr-value var-temperature">30</p>
</div>
<div class="attr">
  <p class="attr-title">湿度(%)</p>
  <p class="attr-value var-humidity">30</p>
</div>
</div>
<div class="op-row">
<div class="op var-lock">
    <button>
    <span class="icon-waper">
      <iron-icon icon="mdi:lock"></iron-icon>
    </span>
      童锁
    </button>
</div>
<div class="op var-oscillating">
    <button>
      <span class="icon-waper">
        <iron-icon icon="mdi:fast-forward-30"></iron-icon>
      </span>
      摆头
    </button>
</div>
<div class="op var-natural">
    <button>
      <span class="icon-waper">
        <iron-icon icon="mdi:leaf"></iron-icon>
      </span>
      自然
    </button>
</div>
</div>
`
  return fanbox
}

// 设置UI值
setUI(fanboxa, { title, battery,
     natural_speed,temperature,humidity,
      state,child_lock,oscillating,led_brightness
      //buzzer,angle,speed_level,led_brightness 
    }) {

fanboxa.querySelector('.var-title').textContent = title
fanboxa.querySelector('.var-battery').textContent = battery
fanboxa.querySelector('.var-temperature').textContent = temperature
fanboxa.querySelector('.var-humidity').textContent = humidity
  //LED
  let activeElement = fanboxa.querySelector('.c3')
  if (led_brightness < 2) {
    if (activeElement.classList.contains('active') === false) {
      activeElement.classList.add('active')
    }
  } else {
    activeElement.classList.remove('active')
    // div.querySelector('.bg-on').removeChild(div.querySelector('.container'))
  }
  //状态
    activeElement = fanboxa.querySelector('.fanbox')
  if (state === 'on') {
    if (activeElement.classList.contains('active') === false) {
      activeElement.classList.add('active')
    }
  } else {
    activeElement.classList.remove('active')
    // div.querySelector('.bg-on').removeChild(div.querySelector('.container'))
  }
  // 童锁
  activeElement = fanboxa.querySelector('.var-lock')
  if (child_lock) {
    if (activeElement.classList.contains('active') === false) {
      activeElement.classList.add('active')
    }
  } else {
    activeElement.classList.remove('active')
  }
  // 自然
  activeElement = fanboxa.querySelector('.var-natural')
  if (natural_speed) {
    if (activeElement.classList.contains('active') === false) {
      activeElement.classList.add('active')
      activeElement.innerHTML = '<button><span class="icon-waper"><iron-icon icon="mdi:leaf"></iron-icon></span>自然</button>'
    }
  } else {
    activeElement.classList.remove('active')
    activeElement.innerHTML = '<button><span class="icon-waper"><iron-icon icon="mdi:weather-windy"></iron-icon></span>直吹</button>'
  }
  // 摆动
  activeElement = fanboxa.querySelector('.var-oscillating')
  let fb = fanboxa.querySelector('.fanbox')
  if (oscillating) {
    
    if (fb.classList.contains('oscillat') === false) {
        fb.classList.add('oscillat')
      }
    if (activeElement.classList.contains('active') === false) {
      // activeElement.classList.add('active')
    }
  } else {
    activeElement.classList.remove('active')
    fb.classList.remove('oscillat')
  }
}
/*********************************** UI设置 ************************************/

// 加入日志开关
log() {
  // console.log(...arguments)
}
}

customElements.define('fan-xiaomi', FanXiaomi);