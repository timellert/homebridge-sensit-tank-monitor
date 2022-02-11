# homebridge-sensit-tank-monitor


Supports tank fill level readings for cloud connected Kingspan SENSiT tank monitors

See here for more product information:
https://www.kingspan.com/gb/en-gb/products/tank-monitoring-systems/remote-tank-monitoring/sensit-smart-wifi-tank-level-monitoring-kit.


This plug-in connects to the SENSiT cloud server every 6 hours (configurable) to read the tank level for each registered tank. Tank 
levels are updated by the Wi-Fi enabled SENSiT hardware. (Note: The SENSiT hardware only refreshes tank levels at cloud service once 
every 
24 hours)

Tank accessories are added to HomeKit as Humidity Sensors as there is no direct support for fill levels in HomeKit. The displayed humidity 
for each accessory is a direct mapping to the tank fill level as a percentage between 0% and 100%. 

# Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-sensit-tank-monitor`
3. Update your configuration file. See sample-config.json in this repository for a sample.

# Configuration

The available fields in the config.json file are:
- `name` [Mandatory] Accessory name.
- `emailAddress` [Mandatory] Username / email address used to log into SENSiT app / account
- `password` [Mandatory] password used to log into SENSiT app / account
- `refresh` [Optional] Number of hours between each SENSiT cloud server poll / refresh (default 6 hours)
- `platform` [Mandatory] Platform name.


Example:

 ```
 "accessories": [
     {
        "name": "SENSiT",
        "emailAddress": "some@emailaddress.com",
        "password": "somePassword!",
        "refresh": "6",
        "platform": "SENSiT"
     }
 ]

```
