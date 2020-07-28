<!--
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2019-10-13 17:46:58
 * @LastEditors   : fineemb
 * @LastEditTime  : 2020-07-28 23:54:57
 -->
# Xiaomi Fan Lovelace Card
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

Xiaomi Smartmi Fan Lovelace card for HASS/Home Assistant.

## Features
+  This card plug-in is based on CSS implementation and is used for HASS, Supports [HACS](https://github.com/custom-components/hacs) installation
+  CSS fan blade and oscillation animation
## Preview
![](02.gif)
## Requirements
  [Xiaomi Mi Smart Pedestal Fan Integration](https://github.com/syssi/xiaomi_fan)

## Update
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
[shaonianzhentan](https://github.com/shaonianzhentan/) 

[花神](https://github.com/yaming116)
