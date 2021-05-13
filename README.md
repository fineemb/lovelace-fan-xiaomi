

# Xiaomi Fan Lovelace Card
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

Xiaomi Smartmi Fan Lovelace card for HASS/Home Assistant.

<a href="https://www.buymeacoffee.com/fineemb" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

## Features
+  This card plug-in is based on CSS implementation and is used for HASS, Supports [HACS](https://github.com/custom-components/hacs) installation
+  CSS fan blade and oscillation animation
## Preview
![](02.gif) 
## Requirements
  [Xiaomi Mi Smart Pedestal Fan Integration](https://github.com/syssi/xiaomi_fan)

## Update
### v1.3.4
  - fix The domain and the service name as changed #4 .
  pls updata [Xiaomi Mi Smart Pedestal Fan Integration](https://github.com/syssi/xiaomi_fan) to the latest

### v1.3.3
  - Update Lovelace UI configuration.

### v1.3.2
  - Fix x1 support
  - Add set delay off
  - Optimize the oscillation adjustment UI
### v1.3.1
  - Optimize the oscillation adjustment UI
  - Optimize the UI configuration panel
  - Support for dmaker.fan.p5 model
  - 140 oscillation support 
### v1.3.0
 - Rebuild code
 - Optimize and fix multiple logic problems
 - Optimize the UI configuration panel
### v1.2.2
 - Swing angle UI display
 - Add aspect-ratio configuration
 - Add background color configuration
### v1.2.1
 - Fix the problem of speed information out of sync.
 - Add sway angle interaction.
 - Support for Lovelace UI configuration.
### v1.2
 - Delete the temperature and humidity information.
 - Refactor the layout.
 - Increase battery power ring display (if device supports)
 - Increase the speed of the regulation.
 - Increase the angle adjustment button.
 
## HACS Installation
Search for Lovelace-fan-xiaomi
## Manual Installation
1.  Download fan-xiaomi.js 
1. Copy to www\community\lovelace-fan-xiaomi\fan-xiaomi.js
1.  Add the following to your Lovelace resources
    ``` yaml
    resources:
      - url: /hacsfiles/lovelace-fan-xiaomi/fan-xiaomi.js?v=0.2
        type: module
    ```
1.  Add the following to your Lovelace config views.cards key
    ``` yaml
    type: 'custom:fan-xiaomi'
    name: Fan
    entity: fan.zhi_neng_dian_feng_shan_3
    ```

## Credits
[花神](https://github.com/yaming116)
