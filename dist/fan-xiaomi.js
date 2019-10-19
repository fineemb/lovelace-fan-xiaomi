/*
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2019-10-12 02:38:30
 * @LastEditors   : fineemb
 * @LastEditTime  : 2019-10-19 08:25:53
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

        let styleElement = document.createElement('style');
        styleElement.innerHTML = `.fan-xiaomi{height: 64px;}`;
        card.appendChild(styleElement);

        this.card = card;
        this.appendChild(card);
        ui.querySelector('.var-title').textContent = this.config.name+'(离线)';
      }
    }else{
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
    return 3;
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
  let fanbox = document.createElement('div')
  fanbox.className = 'fan-xiaomi-panel'
  fanbox.innerHTML = `
<style>
.fan-xiaomi{position:relative;overflow:hidden;width:100%;height:335px}
.offline{opacity:0.3}
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
.fanbox{position:relative;margin:10px auto;width:150px;height:150px;border-radius:50%;background:#80808061}
.fanbox.active.oscillat{animation:oscillate 8s infinite linear}
.blades div{position:absolute;margin:15% 0 0 15%;width:35%;height:35%;border-radius:100% 50% 0;background:#989898;transform-origin:100% 100%}
.blades{width:100%;height:100%}
.fanbox.active .blades{transform-origin:50% 50%;animation:blades 3s infinite linear;transform-box:fill-box!important}
.fan{top:0;transform-origin:0 250%}
.fan,.fan1{position:absolute;left:0;margin-left:50%;width:1%;height:20%;background:#fff}
.fan1{top:20%;transform-origin:0 150%}
.c1{top:20%;left:20%;width:60%;height:60%;border:2px solid #fff;border-radius:50%;cursor:pointer;baskground:#ffffff00}
.c1,.c2{position:absolute;box-sizing:border-box}
.c2{top:0;left:0;width:100%;height:100%;border:10px solid #f7f7f7;border-radius:50%}
.c3{position:absolute;top:40%;left:40%;box-sizing:border-box;width:20%;height:20%;border-radius:50%;background:#fff;color:#ddd}
.c3.active{border:2px solid #8dd5c3}
.c3 span iron-icon{width:100%;height:100%}
.chevron{position:absolute;top:0;height:100%;opacity:0}
.show{opacity:1}
.hidden{opacity:0}
.chevron.left{left:-30px}
.chevron.right{right:-30px}
.chevron span,.chevron span iron-icon{width:30px;height:100%}

@keyframes blades{0%{transform:translate(0,0) rotate(0)}
to{transform:translate(0,0) rotate(3600deg)}
}
@keyframes oscillate{0%{transform:perspective(10em) rotateY(0)}
20%{transform:perspective(10em) rotateY(40deg)}
40%{transform:perspective(10em) rotateY(0)}
60%{transform:perspective(10em) rotateY(-40deg)}
80%{transform:perspective(10em) rotateY(0)}
to{transform:perspective(10em) rotateY(40deg)}
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
  `+fans+fan1s+`
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